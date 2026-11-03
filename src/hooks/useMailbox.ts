import { useEffect, useState, useSyncExternalStore } from 'react'
import type {
  ClassifiedMessage,
  EmailRepository,
  MetricEvent,
} from '../domain/models'
import { GmailAuthorization } from '../services/gmailAuthorization'
import {
  GmailEmailRepository,
  type GmailCoverage,
  type GmailProgress,
  type GmailRequestDiagnostics,
} from '../repositories/gmailEmailRepository'
import { MemoryInstrumentation } from '../services/metrics'
import { loadInbox } from '../services/loadInbox'
import { safeGmailError } from '../services/gmailErrors'
interface MailboxResult {
  key: string
  status: 'ready' | 'error'
  messages: ClassifiedMessage[]
  events: readonly MetricEvent[]
  coverage: GmailCoverage | null
  diagnostics: GmailRequestDiagnostics | null
  durationMs: number | null
  error: string
}
export function useMailbox(
  mockRepository: EmailRepository,
  authorization: GmailAuthorization,
) {
  const auth = useSyncExternalStore(
    authorization.subscribe,
    authorization.getSnapshot,
  )
  const isLive = auth.status === 'connected'
  const [revision, setRevision] = useState(0)
  const key = `${isLive ? `gmail-${auth.version}` : 'mock'}:${revision}`
  const [result, setResult] = useState<MailboxResult | null>(null)
  const [progressState, setProgress] = useState<{
    key: string
    progress: GmailProgress
  } | null>(null)
  useEffect(() => {
    const controller = new AbortController()
    const instrumentation = new MemoryInstrumentation()
    const startedAt = performance.now()
    const liveRepository = isLive
      ? new GmailEmailRepository({
          token: authorization.getToken,
          unauthorized: authorization.invalidate,
          signal: controller.signal,
          progress: (progress) => {
            if (!controller.signal.aborted) setProgress({ key, progress })
          },
        })
      : null
    void loadInbox(
      liveRepository ?? mockRepository,
      instrumentation,
      `load-${revision}`,
      undefined,
      { source: isLive ? 'real' : 'synthetic', signal: controller.signal },
    )
      .then((messages) => {
        if (!controller.signal.aborted)
          setResult({
            key,
            status: 'ready',
            messages,
            events: instrumentation.snapshot(),
            coverage: liveRepository ? { ...liveRepository.coverage } : null,
            diagnostics: liveRepository
              ? { ...liveRepository.diagnostics }
              : null,
            durationMs: isLive ? performance.now() - startedAt : null,
            error: '',
          })
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          // Abort any sibling requests before exposing a sanitized failure.
          controller.abort()
          setResult({
            key,
            status: 'error',
            messages: [],
            events: instrumentation.snapshot(),
            coverage: null,
            diagnostics: liveRepository
              ? { ...liveRepository.diagnostics }
              : null,
            durationMs: isLive ? performance.now() - startedAt : null,
            error: isLive
              ? safeGmailError(error)
              : 'The local message source failed validation or could not be read. Try loading it again.',
          })
        }
      })
    return () => controller.abort()
  }, [key, isLive, revision, mockRepository, authorization])
  useEffect(() => {
    let version = authorization.getSnapshot().version
    return authorization.subscribe(() => {
      const nextVersion = authorization.getSnapshot().version
      if (nextVersion !== version) {
        version = nextVersion
        setResult(null)
        setProgress(null)
      }
    })
  }, [authorization])
  useEffect(() => () => authorization.dispose(), [authorization])
  // A source/session key prevents old private records or metrics flashing after disconnect.
  const current = result?.key === key ? result : null
  return {
    auth,
    isLive,
    key,
    status: current?.status ?? 'loading',
    messages: current?.messages ?? [],
    events: current?.events ?? [],
    coverage: current?.coverage ?? null,
    diagnostics: current?.diagnostics ?? null,
    durationMs: current?.durationMs ?? null,
    retainedLiveMessageCount: result?.key.startsWith('gmail-')
      ? result.messages.length
      : 0,
    error: current?.error ?? '',
    progress: progressState?.key === key ? progressState.progress : null,
    refresh: () => setRevision((value) => value + 1),
  }
}
