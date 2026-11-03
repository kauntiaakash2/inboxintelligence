import { vi } from 'vitest'
import {
  GMAIL_READONLY_SCOPE,
  type GoogleOAuth,
  type TokenClientConfig,
} from '../services/googleIdentity'
export function fakeGoogle() {
  let config: TokenClientConfig | undefined
  const provider: GoogleOAuth = {
    initTokenClient: vi.fn((value) => {
      config = value
      return { requestAccessToken: vi.fn() }
    }),
    hasGrantedAllScopes: vi.fn(() => true),
    revoke: vi.fn((_token, done) => done({ successful: true })),
  }
  return {
    provider,
    get config() {
      if (!config) throw new Error('Authorization was not initiated')
      return config
    },
    grant: (overrides: Record<string, unknown> = {}) => {
      if (!config) throw new Error('Authorization was not initiated')
      config.callback({
        access_token: 'test-only-token',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: GMAIL_READONLY_SCOPE,
        ...overrides,
      })
    },
  }
}
export const gmailMetadata = (
  id = 'message1',
  internalDate = '1793520000000',
) => ({
  id,
  internalDate,
  labelIds: ['INBOX', 'UNREAD'],
  payload: {
    headers: [
      { name: 'From', value: '"Test Sender" <sender@example.test>' },
      { name: 'Subject', value: 'Interview invitation' },
      { name: 'Date', value: 'Sun, 1 Nov 2026 08:00:00 GMT' },
    ],
  },
})
export const jsonResponse = (
  value: unknown,
  status = 200,
  headers: Record<string, string> = {},
) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
