import { useEffect, useState } from 'react'
export const WORKSPACE_STORAGE_KEY = 'inbox-intelligence.workspace'
export interface WorkspacePreferences {
  schemaVersion: 2
  sidebarState: 'expanded' | 'collapsed'
  density: 'comfortable' | 'compact'
  readingLayout: 'dialog' | 'split'
  defaultView: 'Inbox explorer' | 'Overview' | 'Analytics'
}
export const defaultWorkspacePreferences = (): WorkspacePreferences => ({
  schemaVersion: 2,
  sidebarState: 'expanded',
  density: 'comfortable',
  readingLayout: 'dialog',
  defaultView: 'Inbox explorer',
})
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
export function validateWorkspacePreferences(
  value: unknown,
): WorkspacePreferences | null {
  if (!isRecord(value)) return null
  const record = value
  if (
    !(
      (record.schemaVersion === 1 &&
        Object.keys(record).sort().join(',') ===
          'defaultView,density,readingLayout,schemaVersion') ||
      (record.schemaVersion === 2 &&
        Object.keys(record).sort().join(',') ===
          'defaultView,density,readingLayout,schemaVersion,sidebarState' &&
        (record.sidebarState === 'expanded' ||
          record.sidebarState === 'collapsed'))
    ) ||
    (record.density !== 'comfortable' && record.density !== 'compact') ||
    (record.readingLayout !== 'dialog' && record.readingLayout !== 'split') ||
    (record.defaultView !== 'Inbox explorer' &&
      record.defaultView !== 'Overview' &&
      record.defaultView !== 'Analytics')
  )
    return null
  return {
    schemaVersion: 2,
    sidebarState:
      record.schemaVersion === 1
        ? 'expanded'
        : record.sidebarState === 'collapsed'
          ? 'collapsed'
          : 'expanded',
    density: record.density,
    readingLayout: record.readingLayout,
    defaultView: record.defaultView,
  }
}
function loadWorkspacePreferences() {
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY)
    if (raw === null)
      return { preferences: defaultWorkspacePreferences(), notice: '' }
    const preferences =
      raw.length <= 1024
        ? validateWorkspacePreferences(JSON.parse(raw) as unknown)
        : null
    return {
      preferences: preferences ?? defaultWorkspacePreferences(),
      notice: preferences
        ? ''
        : 'Saved display preferences are invalid or unsupported. Defaults are active.',
    }
  } catch {
    return {
      preferences: defaultWorkspacePreferences(),
      notice: 'Display storage is unavailable. Defaults are active.',
    }
  }
}
export function useWorkspacePreferences() {
  const [state, setState] = useState(loadWorkspacePreferences)
  const save = (value: WorkspacePreferences) => {
    const preferences = validateWorkspacePreferences(value)
    if (!preferences) return
    let notice = 'Display preferences saved on this browser.'
    try {
      window.localStorage.setItem(
        WORKSPACE_STORAGE_KEY,
        JSON.stringify(preferences),
      )
    } catch {
      notice =
        'Display preferences applied for this tab; browser storage is unavailable or full.'
    }
    setState({ preferences, notice })
  }
  const reset = () => {
    let notice =
      'Display preferences reset. Inbox is the default on your next visit to /app.'
    try {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY)
    } catch {
      notice =
        'Display defaults restored for this tab. Saved settings may return after reload.'
    }
    setState({ preferences: defaultWorkspacePreferences(), notice })
  }
  return { ...state, save, reset }
}
export function useWideReadingPane(enabled: boolean) {
  const [wide, setWide] = useState(
    () =>
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(min-width: 1100px)').matches,
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(min-width: 1100px)')
    const update = () => setWide(query.matches)
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])
  return enabled && wide
}
