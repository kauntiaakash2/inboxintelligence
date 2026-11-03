import type { EmailMessage, EmailRepository } from '../domain/models'
import { GmailError } from '../services/gmailErrors'
import { isRecord } from '../services/gmailAuthorization'
import { normalizeGmailMetadata } from './gmailMetadata'
export interface GmailCoverage {
  discovered: number
  loaded: number
  failed: number
  hasMore: boolean
  excludesSpamTrash: true
}
export interface GmailRequestDiagnostics {
  requestAttempts: number
  listAttempts: number
  metadataAttempts: number
  retries: number
}
export interface GmailProgress {
  phase: 'discovery' | 'metadata'
  completed: number
  total: number
}
interface GmailRepositoryOptions {
  token: () => string
  unauthorized: () => void
  signal: AbortSignal
  progress?: (progress: GmailProgress) => void
  fetch?: typeof fetch
  sleep?: (milliseconds: number, signal: AbortSignal) => Promise<void>
}
export function abortableDelay(
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted()
    const abort = () => {
      clearTimeout(timer)
      reject(signal.reason)
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, milliseconds)
    signal.addEventListener('abort', abort, { once: true })
  })
}
export class GmailEmailRepository implements EmailRepository {
  coverage: GmailCoverage = {
    discovered: 0,
    loaded: 0,
    failed: 0,
    hasMore: false,
    excludesSpamTrash: true,
  }
  diagnostics: GmailRequestDiagnostics = {
    requestAttempts: 0,
    listAttempts: 0,
    metadataAttempts: 0,
    retries: 0,
  }
  constructor(private readonly options: GmailRepositoryOptions) {}
  private async request(
    path: string,
    parameters: URLSearchParams,
  ): Promise<unknown> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages${path}?${parameters}`
    for (let attempt = 0; attempt < 3; attempt++) {
      this.options.signal.throwIfAborted()
      let response: Response
      let token: string
      try {
        token = this.options.token()
      } catch {
        throw new GmailError('unauthorized')
      }
      try {
        // Count actual fetch invocations, not scheduled retries or selected message IDs.
        this.diagnostics.requestAttempts++
        if (path === '') this.diagnostics.listAttempts++
        else this.diagnostics.metadataAttempts++
        if (attempt > 0) this.diagnostics.retries++
        response = await (this.options.fetch ?? fetch)(url, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'omit',
          cache: 'no-store',
          redirect: 'error',
          referrerPolicy: 'no-referrer',
          signal: AbortSignal.any([
            this.options.signal,
            AbortSignal.timeout(15000),
          ]),
        })
      } catch {
        this.options.signal.throwIfAborted()
        throw new GmailError('network')
      }
      if (response.status === 401) {
        this.options.unauthorized()
        throw new GmailError('unauthorized')
      }
      if (response.status === 403) throw new GmailError('forbidden')
      if (response.status === 429 || response.status >= 500) {
        if (attempt === 2)
          throw new GmailError(
            response.status === 429 ? 'rate_limited' : 'unavailable',
          )
        const retryAfter = response.headers.get('Retry-After')
        const seconds = retryAfter ? Number(retryAfter) : NaN
        const requested = Number.isFinite(seconds)
          ? seconds * 1000
          : retryAfter
            ? Date.parse(retryAfter) - Date.now()
            : 0
        // Stop rather than violating a server-requested wait longer than this interactive job permits.
        if (requested > 30000) throw new GmailError('rate_limited')
        await (this.options.sleep ?? abortableDelay)(
          Math.max(1000 * 2 ** attempt + Math.random() * 250, requested || 0),
          this.options.signal,
        )
        continue
      }
      if (!response.ok) throw new GmailError('unavailable')
      try {
        return await response.json()
      } catch {
        throw new GmailError('malformed')
      }
    }
    throw new GmailError('unavailable')
  }
  async list(): Promise<EmailMessage[]> {
    this.diagnostics = {
      requestAttempts: 0,
      listAttempts: 0,
      metadataAttempts: 0,
      retries: 0,
    }
    this.coverage = {
      discovered: 0,
      loaded: 0,
      failed: 0,
      hasMore: false,
      excludesSpamTrash: true,
    }
    const ids: string[] = []
    const seen = new Set<string>()
    const pages = new Set<string>()
    let next: string | undefined
    do {
      this.options.progress?.({
        phase: 'discovery',
        completed: ids.length,
        total: 100,
      })
      const params = new URLSearchParams({
        maxResults: String(100 - ids.length),
        includeSpamTrash: 'false',
        fields: 'messages/id,nextPageToken',
      })
      if (next) params.set('pageToken', next)
      const page = await this.request('', params)
      if (
        !isRecord(page) ||
        (page.messages !== undefined && !Array.isArray(page.messages)) ||
        (page.nextPageToken !== undefined &&
          (typeof page.nextPageToken !== 'string' || !page.nextPageToken))
      )
        throw new GmailError('malformed')
      for (const item of page.messages ?? []) {
        if (
          !isRecord(item) ||
          typeof item.id !== 'string' ||
          !/^[a-zA-Z0-9_-]{1,128}$/.test(item.id)
        )
          throw new GmailError('malformed')
        if (!seen.has(item.id) && ids.length < 100) {
          seen.add(item.id)
          ids.push(item.id)
        }
      }
      next = page.nextPageToken as string | undefined
      this.coverage.hasMore = Boolean(next)
      if (next && pages.has(next)) throw new GmailError('malformed')
      if (next) pages.add(next)
      if (pages.size > 100) throw new GmailError('malformed')
    } while (next && ids.length < 100)
    this.coverage.discovered = ids.length
    const messages: EmailMessage[] = []
    let cursor = 0
    let completed = 0
    const worker = async () => {
      while (cursor < ids.length) {
        this.options.signal.throwIfAborted()
        const id = ids[cursor++]!
        try {
          const params = new URLSearchParams({
            format: 'METADATA',
            fields: 'id,internalDate,labelIds,payload/headers',
          })
          for (const header of ['From', 'Subject', 'Date'])
            params.append('metadataHeaders', header)
          messages.push(
            normalizeGmailMetadata(
              await this.request(`/${encodeURIComponent(id)}`, params),
              id,
            ),
          )
        } catch (error) {
          this.options.signal.throwIfAborted()
          if (
            !(error instanceof GmailError) ||
            (error.code !== 'malformed' && error.code !== 'unavailable')
          )
            throw error
          this.coverage.failed++
        }
        completed++
        this.options.progress?.({
          phase: 'metadata',
          completed,
          total: ids.length,
        })
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, ids.length) }, worker))
    this.options.signal.throwIfAborted()
    this.coverage.loaded = messages.length
    if (ids.length && !messages.length) throw new GmailError('malformed')
    return messages.sort(
      (a, b) =>
        b.receivedAt.localeCompare(a.receivedAt) || a.id.localeCompare(b.id),
    )
  }
}
