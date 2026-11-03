import { afterEach, describe, expect, it, vi } from 'vitest'
import { GmailAuthorization } from '../services/gmailAuthorization'
import {
  GMAIL_READONLY_SCOPE,
  loadGoogleIdentity,
} from '../services/googleIdentity'
import { fakeGoogle } from './googleFixtures'
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  delete window.google
  document
    .querySelectorAll('script[src="https://accounts.google.com/gsi/client"]')
    .forEach((script) => script.remove())
})
describe('memory-only explicit authorization', () => {
  it('does nothing on creation and requests only the approved scope from explicit actions', async () => {
    const google = fakeGoogle()
    const load = vi.fn(async () => google.provider)
    const authorization = new GmailAuthorization({
      clientId: 'public-test-client',
      load,
    })
    expect(load).not.toHaveBeenCalled()
    expect(authorization.getSnapshot().status).toBe('disconnected')
    authorization.authorize()
    expect(google.provider.initTokenClient).not.toHaveBeenCalled()
    await authorization.prepare()
    expect(authorization.getSnapshot().status).toBe('ready')
    authorization.authorize()
    expect(google.config).toMatchObject({
      scope: GMAIL_READONLY_SCOPE,
      include_granted_scopes: false,
      prompt: 'select_account',
    })
    const listener = vi.fn()
    const unsubscribe = authorization.subscribe(listener)
    google.grant()
    expect(authorization.getToken()).toBe('test-only-token')
    expect(listener).toHaveBeenCalled()
    expect(JSON.stringify(authorization.getSnapshot())).not.toContain(
      'test-only-token',
    )
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
    await authorization.disconnect()
    expect(google.provider.revoke).toHaveBeenCalledWith(
      'test-only-token',
      expect.any(Function),
    )
    expect(authorization.getSnapshot().status).toBe('disconnected')
    unsubscribe()
    authorization.dispose()
  })
  it.each(['access_denied', 'invalid_client'])(
    'sanitizes OAuth %s',
    async (error) => {
      const google = fakeGoogle()
      const auth = new GmailAuthorization({
        clientId: 'test',
        load: async () => google.provider,
      })
      await auth.prepare()
      auth.authorize()
      google.grant({ error, error_description: 'private details' })
      expect(auth.getSnapshot().status).toBe('error')
      expect(auth.getSnapshot().message).not.toContain('private')
      auth.dispose()
    },
  )
  it('handles popup cancellation and supports a fresh retry', async () => {
    const google = fakeGoogle()
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    google.config.error_callback({ type: 'popup_closed' })
    expect(auth.getSnapshot().message).toContain('popup')
    await auth.prepare()
    auth.authorize()
    google.grant()
    expect(auth.getSnapshot().status).toBe('connected')
    auth.dispose()
  })
  it.each([
    { scope: 'other' },
    { expires_in: 0 },
    { expires_in: 'bad' },
    { access_token: '' },
    { token_type: 'MAC' },
    { expires_in: 999999 },
  ])('rejects invalid grants %j', async (overrides) => {
    const google = fakeGoogle()
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    google.grant(overrides)
    expect(auth.getSnapshot().status).toBe('error')
    auth.dispose()
  })
  it('rejects SDK scope mismatch and malformed responses', async () => {
    const google = fakeGoogle()
    vi.mocked(google.provider.hasGrantedAllScopes).mockReturnValue(false)
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    google.grant()
    expect(auth.getSnapshot().message).toContain('permission')
    await auth.prepare()
    auth.authorize()
    google.config.callback(null)
    expect(auth.getSnapshot().status).toBe('error')
    auth.dispose()
  })
  it('contains SDK scope-check exceptions and ignores duplicate callbacks', async () => {
    const google = fakeGoogle()
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    vi.mocked(google.provider.hasGrantedAllScopes).mockImplementation(() => {
      throw new Error('private SDK response')
    })
    expect(() => google.grant()).not.toThrow()
    expect(auth.getSnapshot().status).toBe('error')
    await auth.prepare()
    auth.authorize()
    vi.mocked(google.provider.hasGrantedAllScopes).mockReturnValue(true)
    google.grant()
    google.config.error_callback({ type: 'late' })
    google.grant({ error: 'late' })
    expect(auth.getSnapshot().status).toBe('connected')
    auth.dispose()
  })
  it('expires automatically and refuses expired access before any request', async () => {
    vi.useFakeTimers()
    const google = fakeGoogle()
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    google.grant({ expires_in: 10 })
    await vi.advanceTimersByTimeAsync(5000)
    expect(auth.getSnapshot().status).toBe('expired')
    expect(() => auth.getToken()).toThrow('expired')
    auth.dispose()
  })
  it('checks the clock even if browser timers were suspended', async () => {
    let now = 0
    const google = fakeGoogle()
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
      now: () => now,
    })
    await auth.prepare()
    auth.authorize()
    google.grant({ expires_in: 10 })
    now = 6000
    expect(() => auth.getToken()).toThrow()
    expect(auth.getSnapshot().status).toBe('expired')
    auth.dispose()
  })
  it('cancels pending script and popup callbacks without reconnecting', async () => {
    const google = fakeGoogle()
    let resolve!: (provider: typeof google.provider) => void
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: () =>
        new Promise((done) => {
          resolve = done
        }),
    })
    const preparing = auth.prepare()
    await auth.disconnect()
    resolve(google.provider)
    await preparing
    expect(auth.getSnapshot().status).toBe('disconnected')
    const other = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await other.prepare()
    other.authorize()
    await other.disconnect()
    google.grant()
    expect(other.getSnapshot().status).toBe('disconnected')
    auth.dispose()
    other.dispose()
  })
  it('handles missing client id, script failure, duplicate actions and popup failure', async () => {
    const missing = new GmailAuthorization({ clientId: '' })
    await missing.prepare()
    expect(missing.getSnapshot().message).toContain('VITE_GOOGLE_CLIENT_ID')
    const failed = new GmailAuthorization({
      clientId: 'test',
      load: async () => {
        throw new Error('private')
      },
    })
    await failed.prepare()
    expect(failed.getSnapshot().status).toBe('error')
    const google = fakeGoogle()
    vi.mocked(google.provider.initTokenClient).mockImplementation(() => {
      throw new Error('private')
    })
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    const pending = auth.prepare()
    await auth.prepare()
    await pending
    auth.authorize()
    expect(auth.getSnapshot().message).toContain('could not open')
    auth.dispose()
  })
  it('reports unconfirmed revocation after clearing local state', async () => {
    const google = fakeGoogle()
    vi.mocked(google.provider.revoke).mockImplementation((_token, done) =>
      done({ successful: false }),
    )
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    google.grant()
    await auth.prepare()
    await auth.disconnect()
    expect(auth.getSnapshot().message).toContain('could not be confirmed')
    expect(auth.getSnapshot().status).toBe('disconnected')
    auth.dispose()
  })
  it('bounds revocation wait and blocks reconnect while revocation is pending', async () => {
    vi.useFakeTimers()
    const google = fakeGoogle()
    vi.mocked(google.provider.revoke).mockImplementation(() => {})
    const auth = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    await auth.prepare()
    auth.authorize()
    google.grant()
    const disconnect = auth.disconnect()
    await auth.prepare()
    await vi.advanceTimersByTimeAsync(10000)
    await disconnect
    expect(auth.getSnapshot().status).toBe('disconnected')
    expect(auth.getSnapshot().message).toContain('could not be confirmed')
    await auth.prepare()
    expect(auth.getSnapshot().status).toBe('ready')
    auth.dispose()
  })
})
describe('on-demand Google script loading', () => {
  it('shares concurrent loads and resolves the provider', async () => {
    const google = fakeGoogle()
    const first = loadGoogleIdentity()
    expect(loadGoogleIdentity()).toBe(first)
    window.google = { accounts: { oauth2: google.provider } }
    document
      .querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      )!
      .dispatchEvent(new Event('load'))
    expect(await first).toBe(google.provider)
    expect(await loadGoogleIdentity()).toBe(google.provider)
  })
  it('handles script failure without leaking browser details', async () => {
    vi.resetModules()
    const { loadGoogleIdentity: load } =
      await import('../services/googleIdentity')
    const promise = load()
    const check = expect(promise).rejects.toThrow('could not load')
    document
      .querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      )!
      .dispatchEvent(new Event('error'))
    await check
  })
  it('times out unavailable scripts and allows retry', async () => {
    vi.resetModules()
    vi.useFakeTimers()
    const { loadGoogleIdentity: load } =
      await import('../services/googleIdentity')
    const promise = load()
    const check = expect(promise).rejects.toThrow('could not load')
    await vi.advanceTimersByTimeAsync(15000)
    await check
    const again = load()
    const checkAgain = expect(again).rejects.toThrow()
    document
      .querySelector<HTMLScriptElement>(
        'script[src="https://accounts.google.com/gsi/client"]',
      )!
      .dispatchEvent(new Event('load'))
    await checkAgain
  })
})
