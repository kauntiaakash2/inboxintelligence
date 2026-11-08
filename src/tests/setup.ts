import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { WORKSPACE_STORAGE_KEY } from '../features/settings/workspacePreferences'
import { PREFERENCE_STORAGE_KEY } from '../repositories/preferenceStore'
afterEach(() => {
  cleanup()
  window.history.replaceState(null, '', '/')
  try {
    localStorage.removeItem(PREFERENCE_STORAGE_KEY)
    localStorage.removeItem(WORKSPACE_STORAGE_KEY)
  } catch {
    /* Storage failure tests may intentionally block access. */
  }
})
