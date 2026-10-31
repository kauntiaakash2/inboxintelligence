import type { EmailMessage, EmailRepository } from '../domain/models'
import { mockMessages } from '../data/mock/messages'
// A runtime boundary makes malformed adapter data fail before it reaches the UI.
export function validateMessages(input: unknown): EmailMessage[] {
  if (!Array.isArray(input)) throw new Error('Expected a message collection')
  const ids = new Set<string>()
  for (const item of input) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.id !== 'string' ||
      !item.id ||
      ids.has(item.id) ||
      typeof item.subject !== 'string' ||
      typeof item.snippet !== 'string' ||
      typeof item.receivedAt !== 'string' ||
      !Number.isFinite(Date.parse(item.receivedAt)) ||
      typeof item.unread !== 'boolean' ||
      !Array.isArray(item.labels) ||
      !item.labels.every((label: unknown) => typeof label === 'string') ||
      typeof item.sender !== 'object' ||
      item.sender === null ||
      typeof item.sender.id !== 'string' ||
      typeof item.sender.name !== 'string' ||
      typeof item.sender.address !== 'string' ||
      !/^[^@\s]+@[^@\s]+$/.test(item.sender.address) ||
      (item.body !== undefined && typeof item.body !== 'string')
    )
      throw new Error('Invalid or duplicate message data')
    ids.add(item.id)
  }
  return input as EmailMessage[]
}
export class MockEmailRepository implements EmailRepository {
  async list(): Promise<EmailMessage[]> {
    return structuredClone(validateMessages(mockMessages))
  }
}
