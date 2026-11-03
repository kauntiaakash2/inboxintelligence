import type { EmailMessage } from '../domain/models'
import { GmailError } from '../services/gmailErrors'
import { isRecord } from '../services/gmailAuthorization'
import { validateMessages } from '../domain/validateMessages'
export function normalizeGmailMetadata(
  value: unknown,
  expectedId: string,
): EmailMessage {
  if (
    !isRecord(value) ||
    value.id !== expectedId ||
    typeof value.internalDate !== 'string' ||
    !/^\d{1,16}$/.test(value.internalDate) ||
    (value.labelIds !== undefined && !Array.isArray(value.labelIds)) ||
    !(value.labelIds ?? []).every(
      (label: unknown) => typeof label === 'string' && label.length <= 512,
    ) ||
    (value.payload !== undefined && !isRecord(value.payload)) ||
    (value.payload?.headers !== undefined &&
      !Array.isArray(value.payload.headers))
  )
    throw new GmailError('malformed')
  const labels: string[] = value.labelIds ?? []
  const milliseconds = Number(value.internalDate)
  if (
    !Number.isSafeInteger(milliseconds) ||
    !Number.isFinite(new Date(milliseconds).getTime())
  )
    throw new GmailError('malformed')
  const headers = new Map<string, string>()
  for (const header of value.payload?.headers ?? []) {
    if (
      !isRecord(header) ||
      typeof header.name !== 'string' ||
      typeof header.value !== 'string' ||
      header.value.length > 32768
    )
      throw new GmailError('malformed')
    headers.set(header.name.toLowerCase(), header.value)
  }
  const from = (headers.get('from') ?? '').trim()
  const match = /^(.*?)<([^<>]+)>$/.exec(from)
  const address = (match?.[2] ?? from).trim()
  const hasAddress = /^[^@\s<>]+@[^@\s<>]+$/.test(address)
  const sender = hasAddress
    ? {
        id: address.toLowerCase(),
        name: match?.[1]?.trim().replace(/^"|"$/g, '') || address,
        address,
      }
    : { id: `unknown:${expectedId}`, name: 'Unknown sender', address: '' }
  const message: EmailMessage = {
    id: expectedId,
    sender,
    subject: headers.get('subject') || '(No subject)',
    snippet: '',
    receivedAt: new Date(milliseconds).toISOString(),
    labels,
    unread: labels.includes('UNREAD'),
  }
  try {
    return validateMessages([message])[0]!
  } catch {
    throw new GmailError('malformed')
  }
}
