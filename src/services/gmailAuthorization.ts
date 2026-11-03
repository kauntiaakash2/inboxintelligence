import {
  GMAIL_READONLY_SCOPE,
  loadGoogleIdentity,
  type GoogleOAuth,
} from './googleIdentity'
export type AuthorizationStatus =
  | 'disconnected'
  | 'disconnecting'
  | 'preparing'
  | 'ready'
  | 'authorizing'
  | 'connected'
  | 'expired'
  | 'error'
export interface AuthorizationState {
  status: AuthorizationStatus
  version: number
  message: string
}
export interface AuthorizationOptions {
  clientId: string
  load?: () => Promise<GoogleOAuth>
  now?: () => number
}
export class GmailAuthorization {
  #token: string | undefined
  #expiresAt = 0
  #provider: GoogleOAuth | undefined
  #attempt = 0
  #timer: ReturnType<typeof setTimeout> | undefined
  #listeners = new Set<() => void>()
  #state: AuthorizationState = {
    status: 'disconnected',
    version: 0,
    message: 'Gmail is disconnected. Mock mode is active.',
  }
  constructor(private readonly options: AuthorizationOptions) {}
  getSnapshot = (): AuthorizationState => this.#state
  subscribe = (listener: () => void) => {
    this.#listeners.add(listener)
    return () => {
      this.#listeners.delete(listener)
    }
  }
  #set(status: AuthorizationStatus, message: string, newSession = false) {
    this.#state = {
      status,
      message,
      version: this.#state.version + (newSession ? 1 : 0),
    }
    for (const listener of this.#listeners) listener()
  }
  #clear() {
    this.#token = undefined
    this.#expiresAt = 0
    clearTimeout(this.#timer)
    this.#timer = undefined
  }
  async prepare(): Promise<void> {
    if (
      this.#state.status === 'preparing' ||
      this.#state.status === 'authorizing' ||
      this.#state.status === 'connected' ||
      this.#state.status === 'disconnecting'
    )
      return
    if (!this.options.clientId.trim()) {
      this.#set(
        'error',
        'Configure the public VITE_GOOGLE_CLIENT_ID locally to enable Gmail.',
      )
      return
    }
    const attempt = ++this.#attempt
    this.#set(
      'preparing',
      'Loading Google authorization. No mailbox access has been requested.',
    )
    try {
      const provider = await (this.options.load ?? loadGoogleIdentity)()
      if (attempt !== this.#attempt) return
      this.#provider = provider
      this.#set(
        'ready',
        'Google authorization is ready. Choose Authorize Gmail to open the consent window.',
      )
    } catch {
      if (attempt === this.#attempt)
        this.#set(
          'error',
          'Google authorization could not load. Check your connection and try again.',
        )
    }
  }
  // Keep requestAccessToken synchronous with the explicit click to avoid popup blocking.
  authorize(): void {
    if (this.#state.status !== 'ready' || !this.#provider) return
    const provider = this.#provider
    const attempt = ++this.#attempt
    this.#set(
      'authorizing',
      'Waiting for Google consent. You can cancel and stay in mock mode.',
    )
    try {
      const client = provider.initTokenClient({
        client_id: this.options.clientId,
        scope: GMAIL_READONLY_SCOPE,
        include_granted_scopes: false,
        prompt: 'select_account',
        callback: (response) => {
          if (attempt !== this.#attempt || this.#state.status !== 'authorizing')
            return
          if (!isRecord(response) || typeof response.error === 'string') {
            this.#set(
              'error',
              'Google consent was denied or authorization failed. No messages were requested.',
            )
            return
          }
          let scopeGranted = false
          try {
            scopeGranted =
              typeof response.scope === 'string' &&
              response.scope.split(/\s+/).includes(GMAIL_READONLY_SCOPE) &&
              provider.hasGrantedAllScopes(response, GMAIL_READONLY_SCOPE)
          } catch {
            /* A malformed SDK callback must not escape into console diagnostics. */
          }
          if (!scopeGranted) {
            this.#set(
              'error',
              'The required Gmail read-only permission was not granted. No messages were requested.',
            )
            return
          }
          const lifetime = Number(response.expires_in)
          if (
            typeof response.access_token !== 'string' ||
            !response.access_token ||
            !Number.isFinite(lifetime) ||
            lifetime <= 0 ||
            lifetime > 86400 ||
            response.token_type !== 'Bearer'
          ) {
            this.#set(
              'error',
              'Google returned an invalid or expired authorization. Please try again.',
            )
            return
          }
          this.#token = response.access_token
          // A short safety margin avoids starting a request at the expiry boundary.
          this.#expiresAt =
            (this.options.now ?? Date.now)() +
            Math.max(0, lifetime * 1000 - 5000)
          this.#timer = setTimeout(
            () => this.invalidate(),
            Math.max(0, this.#expiresAt - (this.options.now ?? Date.now)()),
          )
          this.#set(
            'connected',
            'Gmail authorized with read-only access. Data stays in this page session.',
            true,
          )
        },
        error_callback: () => {
          if (attempt === this.#attempt && this.#state.status === 'authorizing')
            this.#set(
              'error',
              'The Google popup was closed, cancelled, or blocked. Try again when ready.',
            )
        },
      })
      client.requestAccessToken()
    } catch {
      if (attempt === this.#attempt)
        this.#set(
          'error',
          'The Google authorization window could not open. Please try again.',
        )
    }
  }
  getToken = (): string => {
    if (!this.#token || (this.options.now ?? Date.now)() >= this.#expiresAt) {
      this.invalidate()
      throw new Error('Gmail authorization expired. Connect again to continue.')
    }
    return this.#token
  }
  invalidate = (): void => {
    ++this.#attempt
    this.#clear()
    this.#set(
      'expired',
      'Gmail access expired or was revoked. Live data was cleared. Connect again explicitly to continue.',
      true,
    )
  }
  async disconnect(): Promise<void> {
    const token = this.#token
    const provider = this.#provider
    const attempt = ++this.#attempt
    this.#clear()
    this.#set(
      token && provider ? 'disconnecting' : 'disconnected',
      token && provider
        ? 'Live data cleared. Confirming Google revocation; mock mode is active.'
        : 'Gmail disconnected. Live data cleared; mock mode is active.',
      true,
    )
    if (!token || !provider) return
    const revoked = await new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 10000)
      try {
        provider.revoke(token, (response) => {
          clearTimeout(timer)
          resolve(isRecord(response) && response.successful === true)
        })
      } catch {
        clearTimeout(timer)
        resolve(false)
      }
    })
    if (attempt === this.#attempt)
      this.#set(
        'disconnected',
        revoked
          ? 'Gmail disconnected and Google revocation confirmed. Mock mode is active.'
          : 'Local access and live data cleared. Google revocation could not be confirmed; remove access in your Google Account permissions if needed.',
      )
  }
  dispose(): void {
    ++this.#attempt
    this.#clear()
  }
}
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
