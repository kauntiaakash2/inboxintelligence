import { categories } from '../domain/models'
import {
  goalOptions,
  profileOptions,
  type UserPreferences,
} from '../domain/preferences'
import { recommendCategories } from '../features/onboarding/personalize'
export const PREFERENCE_STORAGE_KEY = 'inbox-intelligence.preferences'
type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export interface PreferenceLoad {
  preferences: UserPreferences | null
  notice: string
}
export interface StorageResult {
  ok: boolean
  notice: string
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
export function validatePreferences(value: unknown): UserPreferences | null {
  if (
    !isRecord(value) ||
    Object.keys(value).sort().join(',') !==
      'enabledCategories,goals,profile,schemaVersion,status' ||
    value.schemaVersion !== 1 ||
    (value.status !== 'completed' && value.status !== 'skipped') ||
    (value.profile !== null &&
      !profileOptions.some((option) => option.id === value.profile)) ||
    !Array.isArray(value.goals) ||
    value.goals.length > goalOptions.length ||
    !value.goals.every((goal: unknown) =>
      goalOptions.some((option) => option.id === goal),
    ) ||
    new Set(value.goals).size !== value.goals.length ||
    !Array.isArray(value.enabledCategories) ||
    value.enabledCategories.length > categories.length ||
    !value.enabledCategories.every((category: unknown) =>
      categories.some((option) => option === category),
    ) ||
    new Set(value.enabledCategories).size !== value.enabledCategories.length
  )
    return null
  const preference: UserPreferences = {
    schemaVersion: 1,
    status: value.status as UserPreferences['status'],
    profile: value.profile as UserPreferences['profile'],
    goals: [...value.goals] as UserPreferences['goals'],
    enabledCategories: [
      ...value.enabledCategories,
    ] as UserPreferences['enabledCategories'],
  }
  if (
    preference.status === 'skipped' &&
    (preference.profile !== null ||
      preference.goals.length ||
      preference.enabledCategories.length)
  )
    return null
  const suggestions = recommendCategories(preference.profile, preference.goals)
  if (
    !preference.enabledCategories.every((category) =>
      suggestions.includes(category),
    )
  )
    return null
  // Canonicalize priority and goals rather than trusting ordering from storage.
  preference.goals = goalOptions
    .filter((goal) => preference.goals.includes(goal.id))
    .map((goal) => goal.id)
  preference.enabledCategories = suggestions.filter((category) =>
    preference.enabledCategories.includes(category),
  )
  return preference
}
export class PreferenceStore {
  constructor(
    private readonly storage: () => PreferenceStorage = () =>
      window.localStorage,
  ) {}
  load(): PreferenceLoad {
    try {
      const raw = this.storage().getItem(PREFERENCE_STORAGE_KEY)
      if (raw === null) return { preferences: null, notice: '' }
      if (raw.length > 4096)
        return {
          preferences: null,
          notice:
            'Saved setup is invalid or unsupported. Defaults are active; clear preferences to remove it.',
        }
      const preferences = validatePreferences(JSON.parse(raw) as unknown)
      return {
        preferences,
        notice: preferences
          ? ''
          : 'Saved setup is invalid or unsupported. Defaults are active; clear preferences to remove it.',
      }
    } catch {
      return {
        preferences: null,
        notice:
          'Saved setup could not be read. Defaults are active; setup is still optional.',
      }
    }
  }
  save(value: UserPreferences): StorageResult {
    const validated = validatePreferences(value)
    if (!validated)
      return {
        ok: false,
        notice: 'Preferences were not saved because the setup is invalid.',
      }
    try {
      this.storage().setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(validated))
      return { ok: true, notice: 'Preferences saved on this browser only.' }
    } catch {
      return {
        ok: false,
        notice:
          'Applied for this tab, but browser storage is unavailable or full. Preferences may not survive a reload.',
      }
    }
  }
  clear(): StorageResult {
    try {
      this.storage().removeItem(PREFERENCE_STORAGE_KEY)
      return {
        ok: true,
        notice: 'Preferences cleared. The default view is restored.',
      }
    } catch {
      return {
        ok: false,
        notice:
          'Defaults restored for this tab. Saved setup could not be cleared and may return after reload.',
      }
    }
  }
}
