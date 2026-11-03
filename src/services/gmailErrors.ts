export type GmailErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'rate_limited'
  | 'unavailable'
  | 'malformed'
  | 'network'
const descriptions: Record<GmailErrorCode, string> = {
  unauthorized:
    'Gmail authorization expired or was revoked. Connect again to continue.',
  forbidden:
    'Gmail access was refused. Check the granted permission and Gmail API configuration.',
  rate_limited: 'Google is limiting requests. Wait before refreshing again.',
  unavailable: 'Gmail is temporarily unavailable. Try refreshing later.',
  malformed:
    'Some Gmail metadata could not be validated. No unsafe message data was displayed.',
  network: 'Gmail could not be reached. Check your connection and refresh.',
}
export class GmailError extends Error {
  constructor(readonly code: GmailErrorCode) {
    super(descriptions[code])
    this.name = 'GmailError'
  }
}
export function safeGmailError(error: unknown): string {
  return error instanceof GmailError
    ? error.message
    : 'Gmail metadata could not load. Try refreshing or reconnecting.'
}
