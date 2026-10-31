import { categories, type ClassifiedMessage } from '../../domain/models'
export function summarize(messages: readonly ClassifiedMessage[]) {
  const senderCounts = new Map<string, { name: string; count: number }>()
  const days = new Map<string, number>()
  for (const message of messages) {
    const sender = senderCounts.get(message.sender.id)
    senderCounts.set(message.sender.id, {
      name: message.sender.name,
      count: (sender?.count ?? 0) + 1,
    })
    const day = message.receivedAt.slice(0, 10)
    days.set(day, (days.get(day) ?? 0) + 1)
  }
  return {
    total: messages.length,
    unread: messages.filter((m) => m.unread).length,
    high: messages.filter((m) => m.classification.priority === 'High').length,
    unknown: messages.filter((m) => m.classification.novel).length,
    categories: categories.map((name) => ({
      name,
      count: messages.filter((m) => m.classification.category === name).length,
    })),
    senders: [...senderCounts.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name),
    ),
    days: [...days]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    priorities: (['High', 'Medium', 'Low'] as const).map((name) => ({
      name,
      count: messages.filter((m) => m.classification.priority === name).length,
    })),
  }
}
