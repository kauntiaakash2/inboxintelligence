import type { EmailMessage, EmailRepository } from '../domain/models'
import { mockMessages } from '../data/mock/messages'
import { validateMessages } from '../domain/validateMessages'
export { validateMessages } from '../domain/validateMessages'
export class MockEmailRepository implements EmailRepository {
  async list(): Promise<EmailMessage[]> {
    return structuredClone(validateMessages(mockMessages))
  }
}
