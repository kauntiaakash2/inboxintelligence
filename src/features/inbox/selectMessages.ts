import type {
  ClassifiedMessage,
  EmailCategory,
  Priority,
} from '../../domain/models'
export function selectMessages(
  messages: readonly ClassifiedMessage[],
  query: string,
  category: EmailCategory | 'All',
  priority: Priority | 'All',
): ClassifiedMessage[] {
  const needle = query.trim().toLocaleLowerCase('en-US')
  return messages.filter(
    (message) =>
      (category === 'All' || message.classification.category === category) &&
      (priority === 'All' || message.classification.priority === priority) &&
      [
        message.subject,
        message.snippet,
        message.sender.name,
        message.sender.address,
      ].some((value) => value.toLocaleLowerCase('en-US').includes(needle)),
  )
}
