import { describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { categories } from '../domain/models'
import {
  profileOptions,
  goalOptions,
  skippedPreferences,
  type UserPreferences,
} from '../domain/preferences'
import {
  recommendCategories,
  orderCategories,
  orderMessagesForDisplay,
  enabledFocus,
} from '../features/onboarding/personalize'
import {
  PREFERENCE_STORAGE_KEY,
  PreferenceStore,
  validatePreferences,
} from '../repositories/preferenceStore'
import { usePreferences } from '../hooks/usePreferences'
import { classify } from '../features/classification/classify'
import { mockMessages } from '../data/mock/messages'
const valid: UserPreferences = {
  schemaVersion: 1,
  status: 'completed',
  profile: 'student',
  goals: ['finance'],
  enabledCategories: ['Finance', 'Orders'],
}
function storageFixture(initial: string | null = null) {
  let raw = initial
  const storage = {
    getItem: vi.fn(() => raw),
    setItem: vi.fn((_key: string, value: string) => {
      raw = value
    }),
    removeItem: vi.fn(() => {
      raw = null
    }),
  }
  return { storage, store: new PreferenceStore(() => storage), raw: () => raw }
}
describe('deterministic declared personalization', () => {
  it.each(profileOptions)(
    'maps $label exclusively to supported categories',
    (profile) => {
      const suggestions = recommendCategories(profile.id, [])
      expect(suggestions.length).toBeGreaterThan(0)
      expect(
        suggestions.every((category) => categories.includes(category)),
      ).toBe(true)
      expect(new Set(suggestions).size).toBe(suggestions.length)
    },
  )
  it.each(goalOptions)(
    'maps goal $label and overrides role defaults',
    (goal) => {
      expect(recommendCategories('student', [goal.id])).toEqual(
        recommendCategories('freelancer', [goal.id]),
      )
      expect(
        recommendCategories(null, [goal.id]).every((category) =>
          categories.includes(category),
        ),
      ).toBe(true)
    },
  )
  it('gives canonical goal precedence, deduplicates suggestions and allows an unspecified profile', () => {
    expect(recommendCategories('student', ['finance'])).toEqual([
      'Finance',
      'Orders',
    ])
    expect(recommendCategories(null, [])).toEqual([
      'Personal',
      'Security',
      'Orders',
      'Newsletters',
    ])
    expect(recommendCategories(null, ['finance', 'important'])).toEqual(
      recommendCategories(null, ['important', 'finance']),
    )
  })
  it('reorders presentation without losing or mutating records/classification', () => {
    const input = mockMessages.map((message) => ({
      ...message,
      classification: classify(message),
    }))
    const before = JSON.stringify(input)
    const ordered = orderMessagesForDisplay(input, valid)
    expect(ordered).toHaveLength(96)
    expect(new Set(ordered.map((message) => message.id))).toEqual(
      new Set(input.map((message) => message.id)),
    )
    expect(ordered[0]?.classification.priority).toBe('High')
    expect(
      ordered.find((message) => message.classification.priority === 'Medium')
        ?.classification.category,
    ).toBe('Finance')
    expect(JSON.stringify(input)).toBe(before)
    expect(ordered.every((message) => input.includes(message))).toBe(true)
    expect(orderMessagesForDisplay(input, skippedPreferences())).toEqual(input)
    expect(
      orderMessagesForDisplay(input, { ...valid, enabledCategories: [] }),
    ).toEqual(input)
  })
  it('keeps every category visible with declared focus first', () => {
    const all = categories.map((name) => ({ name }))
    expect(
      orderCategories(all, valid)
        .map((category) => category.name)
        .slice(0, 2),
    ).toEqual(['Finance', 'Orders'])
    expect(orderCategories(all, valid)).toHaveLength(categories.length)
    expect(orderCategories(all, null)).toEqual(all)
    expect(enabledFocus(null)).toEqual([])
  })
})
describe('versioned, content-free preference schema', () => {
  it('accepts and copies the allowlisted schema with canonical priorities', () => {
    const result = validatePreferences({
      ...valid,
      enabledCategories: ['Orders', 'Finance'],
    })
    expect(result).toEqual(valid)
    expect(result).not.toBe(valid)
    expect(validatePreferences(skippedPreferences())).toEqual(
      skippedPreferences(),
    )
    expect(
      validatePreferences({
        ...valid,
        profile: null,
        goals: [],
        enabledCategories: [],
      }),
    ).not.toBeNull()
  })
  it.each([
    null,
    [],
    {},
    'bad',
    { ...valid, schemaVersion: 0 },
    { ...valid, schemaVersion: 2 },
    { ...valid, status: 'unknown' },
    { ...valid, profile: 'inferred' },
    { ...valid, goals: ['private@example.test'] },
    { ...valid, goals: ['finance', 'finance'] },
    { ...valid, enabledCategories: ['Projects'] },
    { ...valid, enabledCategories: ['Finance', 'Finance'] },
    { ...valid, enabledCategories: ['Security'] },
    { ...valid, access_token: 'synthetic-secret' },
    { ...valid, messageId: 'synthetic-id' },
    { ...skippedPreferences(), profile: 'student' },
    { ...valid, goals: 'finance' },
    { ...valid, enabledCategories: null },
  ])('rejects unsupported/malformed payload %j', (payload) =>
    expect(validatePreferences(payload)).toBeNull(),
  )
})
describe('isolated persistence and storage failures', () => {
  it('loads empty storage without writing or guessing a profile', () => {
    const { store, storage } = storageFixture()
    expect(store.load()).toEqual({ preferences: null, notice: '' })
    expect(storage.setItem).not.toHaveBeenCalled()
  })
  it('roundtrips only the preference record and resets only its own key', () => {
    const { store, storage, raw } = storageFixture()
    expect(store.save(valid).ok).toBe(true)
    expect(storage.setItem).toHaveBeenCalledWith(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify(valid),
    )
    expect(store.load().preferences).toEqual(valid)
    expect(raw()).not.toMatch(/token|subject|sender|messageId/)
    expect(store.clear().ok).toBe(true)
    expect(storage.removeItem).toHaveBeenCalledWith(PREFERENCE_STORAGE_KEY)
    expect(store.load().preferences).toBeNull()
  })
  it.each([
    '{bad',
    JSON.stringify({ ...valid, schemaVersion: 99 }),
    'x'.repeat(4097),
  ])(
    'handles corrupt/unknown/oversized storage without destructive migration',
    (raw) => {
      const { store, storage } = storageFixture(raw)
      expect(store.load().preferences).toBeNull()
      expect(store.load().notice).not.toBe('')
      expect(storage.setItem).not.toHaveBeenCalled()
      expect(storage.removeItem).not.toHaveBeenCalled()
    },
  )
  it('catches blocked storage getters, writes and deletes without echoing errors', () => {
    const store = new PreferenceStore(() => {
      throw new Error('private browser error')
    })
    expect(store.load().preferences).toBeNull()
    expect(store.save(valid).ok).toBe(false)
    expect(store.clear().ok).toBe(false)
    expect(
      JSON.stringify([store.load(), store.save(valid), store.clear()]),
    ).not.toContain('private browser error')
  })
  it('rejects unknown fields at save rather than serializing arbitrary values', () => {
    const { store, storage } = storageFixture()
    const unexpected = { ...valid, token: 'synthetic-token' }
    expect(store.save(unexpected).ok).toBe(false)
    expect(storage.setItem).not.toHaveBeenCalled()
  })
  it('keeps usable in-memory choices when saving fails and explains failed clearing', () => {
    const store = new PreferenceStore(() => ({
      getItem: () => null,
      setItem: () => {
        throw new Error('quota')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    }))
    const { result } = renderHook(() => usePreferences(store))
    act(() => result.current.save(valid))
    expect(result.current.preferences).toEqual(valid)
    expect(result.current.notice).toContain('Applied for this tab')
    act(() => result.current.reset())
    expect(result.current.preferences).toBeNull()
    expect(result.current.notice).toContain('may return after reload')
  })
  it('rejects malformed programmatic updates without replacing existing preferences', () => {
    const { store } = storageFixture(JSON.stringify(valid))
    const { result } = renderHook(() => usePreferences(store))
    const unexpected = { ...valid, token: 'synthetic-token' }
    act(() => result.current.save(unexpected))
    expect(result.current.preferences).toEqual(valid)
    expect(result.current.notice).toContain('not applied')
    act(() => result.current.skip())
    expect(result.current.preferences).toEqual(skippedPreferences())
  })
})
