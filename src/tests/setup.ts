import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { PREFERENCE_STORAGE_KEY } from '../repositories/preferenceStore'
afterEach(() => {
  cleanup()
  try {
    localStorage.removeItem(PREFERENCE_STORAGE_KEY)
  } catch {
    /* Storage failure tests may intentionally block access. */
  }
})
