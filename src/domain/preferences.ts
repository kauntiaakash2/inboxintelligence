import type { EmailCategory } from './models'
export const profileOptions = [
  { id: 'student', label: 'Student' },
  { id: 'professional', label: 'Working professional' },
  { id: 'freelancer', label: 'Freelancer/business owner' },
  { id: 'general', label: 'General use' },
  { id: 'prefer-not-to-say', label: 'Prefer not to say' },
] as const
export type ProfileId = (typeof profileOptions)[number]['id']
export const goalOptions = [
  { id: 'important', label: 'Find important messages' },
  { id: 'deadlines', label: 'Track deadlines' },
  { id: 'career', label: 'Career and internship opportunities' },
  { id: 'clutter', label: 'Understand inbox clutter' },
  { id: 'patterns', label: 'Analyze email patterns' },
  { id: 'finance', label: 'Organize financial notifications' },
] as const
export type GoalId = (typeof goalOptions)[number]['id']
export interface UserPreferences {
  schemaVersion: 1
  status: 'completed' | 'skipped'
  profile: ProfileId | null
  goals: GoalId[]
  enabledCategories: EmailCategory[]
}
export interface PreferenceDraft {
  profile: ProfileId | null
  goals: GoalId[]
  enabledCategories: EmailCategory[]
}
export const skippedPreferences = (): UserPreferences => ({
  schemaVersion: 1,
  status: 'skipped',
  profile: null,
  goals: [],
  enabledCategories: [],
})
