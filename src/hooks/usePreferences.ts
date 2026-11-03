import { useState } from 'react'
import { skippedPreferences, type UserPreferences } from '../domain/preferences'
import {
  PreferenceStore,
  validatePreferences,
} from '../repositories/preferenceStore'
export function usePreferences(store: PreferenceStore) {
  const [state, setState] = useState(() => store.load())
  const save = (preferences: UserPreferences) => {
    const validated = validatePreferences(preferences)
    if (!validated) {
      setState((previous) => ({
        ...previous,
        notice: 'Preferences were not applied because the setup is invalid.',
      }))
      return
    }
    const result = store.save(validated)
    setState({ preferences: validated, notice: result.notice })
  }
  const reset = () => {
    const result = store.clear()
    setState({ preferences: null, notice: result.notice })
  }
  return { ...state, save, skip: () => save(skippedPreferences()), reset }
}
