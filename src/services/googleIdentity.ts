export const GMAIL_READONLY_SCOPE =
  'https://www.googleapis.com/auth/gmail.readonly'
export interface TokenClientConfig {
  client_id: string
  scope: string
  include_granted_scopes: false
  prompt: 'select_account'
  callback: (response: unknown) => void
  error_callback: (error: unknown) => void
}
export interface GoogleOAuth {
  initTokenClient(config: TokenClientConfig): { requestAccessToken(): void }
  hasGrantedAllScopes(response: unknown, ...scopes: string[]): boolean
  revoke(token: string, done: (response: unknown) => void): void
}
declare global {
  interface Window {
    google?: { accounts?: { oauth2?: GoogleOAuth } }
  }
}
let pending: Promise<GoogleOAuth> | undefined
// Called only by a user action. No Google script is loaded in default mock mode.
export function loadGoogleIdentity(): Promise<GoogleOAuth> {
  if (window.google?.accounts?.oauth2)
    return Promise.resolve(window.google.accounts.oauth2)
  if (pending) return pending
  pending = new Promise<GoogleOAuth>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.referrerPolicy = 'no-referrer'
    const finish = (error?: Error) => {
      clearTimeout(timer)
      script.onload = null
      script.onerror = null
      const api = window.google?.accounts?.oauth2
      if (!error && api) resolve(api)
      else {
        script.remove()
        pending = undefined
        reject(
          new Error(
            'Google authorization could not load. Check your connection and try again.',
          ),
        )
      }
    }
    const timer = setTimeout(() => finish(new Error('timeout')), 15000)
    script.onload = () => finish()
    script.onerror = () => finish(new Error('network'))
    document.head.append(script)
  })
  return pending
}
