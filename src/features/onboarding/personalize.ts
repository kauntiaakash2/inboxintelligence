import type { ClassifiedMessage, EmailCategory } from '../../domain/models'
import {
  goalOptions,
  type GoalId,
  type ProfileId,
  type UserPreferences,
} from '../../domain/preferences'
export const roleCategories: Record<ProfileId, readonly EmailCategory[]> = {
  student: ['Education', 'Jobs and internships', 'Events and deadlines'],
  professional: ['Security', 'Events and deadlines', 'Finance'],
  freelancer: ['Personal', 'Finance', 'Events and deadlines'],
  general: ['Personal', 'Security', 'Orders', 'Newsletters'],
  'prefer-not-to-say': ['Personal', 'Security', 'Orders', 'Newsletters'],
}
export const goalCategories: Record<GoalId, readonly EmailCategory[]> = {
  important: ['Security', 'Personal', 'Events and deadlines'],
  deadlines: ['Events and deadlines', 'Education'],
  career: ['Jobs and internships', 'Education'],
  clutter: ['Promotions', 'Newsletters', 'Spam review'],
  patterns: ['Newsletters', 'Promotions', 'Personal'],
  finance: ['Finance', 'Orders'],
}
export function recommendCategories(
  profile: ProfileId | null,
  goals: readonly GoalId[],
): EmailCategory[] {
  // Canonical goal order avoids assigning hidden priority based on checkbox click order.
  const selected = goalOptions.filter((goal) => goals.includes(goal.id))
  return [
    ...new Set(
      selected.length
        ? selected.flatMap((goal) => goalCategories[goal.id])
        : roleCategories[profile ?? 'general'],
    ),
  ]
}
export function enabledFocus(
  preferences: UserPreferences | null,
): readonly EmailCategory[] {
  return preferences?.status === 'completed'
    ? preferences.enabledCategories
    : []
}
export function orderCategories<T extends { name: EmailCategory }>(
  items: readonly T[],
  preferences: UserPreferences | null,
): T[] {
  const focus = enabledFocus(preferences)
  const rank = (category: EmailCategory) => {
    const index = focus.indexOf(category)
    return index < 0 ? focus.length : index
  }
  return [...items].sort((a, b) => rank(a.name) - rank(b.name))
}
export function orderMessagesForDisplay(
  messages: readonly ClassifiedMessage[],
  preferences: UserPreferences | null,
): ClassifiedMessage[] {
  const focus = enabledFocus(preferences)
  if (!focus.length) return [...messages]
  const priority = { High: 3, Medium: 2, Low: 1 }
  const rank = (category: EmailCategory) => {
    const index = focus.indexOf(category)
    return index < 0 ? focus.length : index
  }
  // All records remain; declared focus only reorders within existing rule-priority bands.
  return [...messages].sort(
    (a, b) =>
      priority[b.classification.priority] -
        priority[a.classification.priority] ||
      rank(a.classification.category) - rank(b.classification.category) ||
      b.receivedAt.localeCompare(a.receivedAt),
  )
}
