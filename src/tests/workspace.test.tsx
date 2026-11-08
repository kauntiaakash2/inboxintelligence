import { act, render, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../app/App'
import {
  defaultWorkspacePreferences,
  useWorkspacePreferences,
  validateWorkspacePreferences,
  WORKSPACE_STORAGE_KEY,
  useWideReadingPane,
} from '../features/settings/workspacePreferences'
import { PREFERENCE_STORAGE_KEY } from '../repositories/preferenceStore'
import { skippedPreferences } from '../domain/preferences'
import { viewFromPath, isDashboardPath } from '../app/useDashboardNavigation'

describe('workspace preference boundary', () => {
  const defaults = defaultWorkspacePreferences()
  it('has safe optional display defaults and distinct versioned storage', () => {
    expect(validateWorkspacePreferences(defaults)).toEqual(defaults)
    expect(validateWorkspacePreferences(defaults)).not.toBe(defaults)
    expect(WORKSPACE_STORAGE_KEY).not.toBe(PREFERENCE_STORAGE_KEY)
    expect(viewFromPath('/app')).toBe('Inbox explorer')
    expect(viewFromPath('/app', 'Analytics')).toBe('Analytics')
    expect(viewFromPath('/app/overview', 'Inbox explorer')).toBe('Overview')
    expect(isDashboardPath('/app/')).toBe(true)
  })
  it.each([
    null,
    [],
    {},
    'bad',
    { ...defaults, schemaVersion: 3 },
    { ...defaults, density: 'tiny' },
    { ...defaults, readingLayout: 'html' },
    { ...defaults, defaultView: 'private-email' },
    { ...defaults, access_token: 'synthetic-secret' },
  ])('rejects malformed or expanded payload %j', (value) =>
    expect(validateWorkspacePreferences(value)).toBeNull(),
  )
  it.each([
    '{bad',
    JSON.stringify({ ...defaults, schemaVersion: 9 }),
    'x'.repeat(1025),
  ])('falls back from invalid storage without logging it', (raw) => {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, raw)
    const { result } = renderHook(() => useWorkspacePreferences())
    expect(result.current.preferences).toEqual(defaults)
    expect(result.current.notice).not.toContain(raw)
    expect(result.current.notice).not.toBe('')
  })
  it('writes only explicit valid choices and resets only its own key', () => {
    localStorage.setItem(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify(skippedPreferences()),
    )
    const { result } = renderHook(() => useWorkspacePreferences())
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull()
    const unexpected = { ...defaults, token: 'synthetic-token' }
    act(() => result.current.save(unexpected))
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull()
    act(() => result.current.save({ ...defaults, density: 'compact' }))
    expect(
      JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? 'null'),
    ).toEqual({ ...defaults, density: 'compact' })
    act(() => result.current.reset())
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).toBe(
      JSON.stringify(skippedPreferences()),
    )
  })
  it('keeps tab-local choices and honest notices through read/write/delete failures', () => {
    const read = vi
      .spyOn(Storage.prototype, 'getItem')
      .mockImplementation(() => {
        throw new Error('synthetic private read')
      })
    const write = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('synthetic private write')
      })
    const remove = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('synthetic private remove')
      })
    try {
      const { result } = renderHook(() => useWorkspacePreferences())
      expect(result.current.notice).toContain('unavailable')
      act(() => result.current.save({ ...defaults, density: 'compact' }))
      expect(result.current.preferences.density).toBe('compact')
      expect(result.current.notice).toContain('this tab')
      act(() => result.current.reset())
      expect(result.current.preferences).toEqual(defaults)
      expect(result.current.notice).toContain('may return after reload')
      expect(result.current.notice).not.toContain('private')
    } finally {
      read.mockRestore()
      write.mockRestore()
      remove.mockRestore()
    }
  })
})
describe('inbox-first workflow', () => {
  beforeEach(() => window.history.replaceState(null, '', '/app'))
  it('starts in Inbox with global local search, combined filters and no initial persistence', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument()
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull()
    await user.keyboard('/')
    expect(
      screen.getByRole('textbox', { name: 'Search messages' }),
    ).toHaveFocus()
    await user.type(
      screen.getByRole('textbox', { name: 'Search messages' }),
      'INTERVIEW',
    )
    expect(screen.getByText('6 messages', { exact: true })).toBeInTheDocument()
    document.querySelector<HTMLDetailsElement>('.filter-disclosure')!.open =
      true
    await user.selectOptions(
      screen.getByLabelText('Category'),
      'Jobs and internships',
    )
    document.querySelector<HTMLDetailsElement>('.filter-disclosure')!.open =
      true
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    expect(screen.getByText('6 messages', { exact: true })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    expect(screen.getByText('96 messages', { exact: true })).toBeInTheDocument()
    expect(
      document.querySelectorAll('.mail-read-state[aria-label="Unread"]'),
    ).toHaveLength(32)
    expect(
      document.querySelectorAll('.mail-read-state[aria-label="Read"]'),
    ).toHaveLength(64)
  })
  it('persists density/default independently of onboarding and honors explicit routes', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify(skippedPreferences()),
    )
    const first = render(<App />)
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.selectOptions(
      screen.getByLabelText('Display density'),
      'compact',
    )
    expect(document.querySelector('.app-shell')).toHaveClass('density-compact')
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.selectOptions(
      screen.getByLabelText('Default workspace'),
      'Analytics',
    )
    expect(
      screen.getByRole('heading', { name: 'Workspace display' }),
    ).toBeInTheDocument()
    first.unmount()
    window.history.replaceState(null, '', '/app')
    const second = render(<App />)
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    expect(
      screen.getByRole('heading', { name: 'Insights' }),
    ).toBeInTheDocument()
    second.unmount()
    window.history.replaceState(null, '', '/app/inbox')
    render(<App />)
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    expect(screen.getByRole('heading', { name: 'Inbox' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.click(
      screen.getByRole('button', { name: 'Reset display preferences' }),
    )
    expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).toBe(
      JSON.stringify(skippedPreferences()),
    )
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBeNull()
  })
  it('uses the already-loaded reading pane on wide screens and responds to resize', async () => {
    const original = Object.getOwnPropertyDescriptor(window, 'matchMedia')
    let resize = () => {}
    const query = {
      matches: true,
      addEventListener: vi.fn((_event: string, listener: () => void) => {
        resize = listener
      }),
      removeEventListener: vi.fn(),
    }
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => query,
    })
    try {
      const user = userEvent.setup()
      const rendered = render(<App />)
      await screen.findByText('Demo processing complete')
      document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
        true
      await user.click(screen.getByRole('button', { name: 'Settings' }))
      await user.selectOptions(screen.getByLabelText('Reading layout'), 'split')
      await user.click(screen.getByRole('button', { name: 'Inbox explorer' }))
      expect(
        screen.queryByRole('region', { name: 'Message reading pane' }),
      ).not.toBeInTheDocument()
      const row = document.querySelector<HTMLButtonElement>('.mail-row')
      expect(row).not.toBeNull()
      if (!row) throw new Error('Missing synthetic row')
      await user.click(row)
      const pane = screen.getByRole('region', { name: 'Message reading pane' })
      expect(
        within(pane).getByRole('heading', { name: 'Why this category?' }),
      ).toBeInTheDocument()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await user.keyboard('{Escape}')
      expect(row).toHaveFocus()
      act(() => {
        query.matches = false
        resize()
      })
      expect(
        screen.queryByRole('region', { name: 'Message reading pane' }),
      ).not.toBeInTheDocument()
      rendered.unmount()
      expect(query.removeEventListener).toHaveBeenCalled()
    } finally {
      if (original) Object.defineProperty(window, 'matchMedia', original)
      else Reflect.deleteProperty(window, 'matchMedia')
    }
  })
  it('handles the absent matchMedia environment without enabling a pane', () => {
    const { result } = renderHook(() => useWideReadingPane(true))
    expect(result.current).toBe(false)
  })
})

describe('sidebar display migration and controls', () => {
  beforeEach(() => window.history.replaceState(null, '', '/app'))
  it('migrates exact v1 choices in memory without writing or changing onboarding', () => {
    const legacy = {
      schemaVersion: 1,
      density: 'compact',
      readingLayout: 'split',
      defaultView: 'Overview',
    }
    const raw = JSON.stringify(legacy)
    localStorage.setItem(WORKSPACE_STORAGE_KEY, raw)
    localStorage.setItem(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify(skippedPreferences()),
    )
    const { result } = renderHook(() => useWorkspacePreferences())
    expect(result.current.preferences).toEqual({
      ...legacy,
      schemaVersion: 2,
      sidebarState: 'expanded',
    })
    expect(localStorage.getItem(WORKSPACE_STORAGE_KEY)).toBe(raw)
    act(() =>
      result.current.save({
        ...result.current.preferences,
        sidebarState: 'collapsed',
      }),
    )
    expect(
      JSON.parse(localStorage.getItem(WORKSPACE_STORAGE_KEY) ?? 'null'),
    ).toEqual({ ...legacy, schemaVersion: 2, sidebarState: 'collapsed' })
    expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).toBe(
      JSON.stringify(skippedPreferences()),
    )
  })
  it.each(['hidden', null, 1])(
    'rejects an invalid sidebar state %j',
    (sidebarState) => {
      expect(
        validateWorkspacePreferences({
          ...defaultWorkspacePreferences(),
          sidebarState,
        }),
      ).toBeNull()
    },
  )
  it('expands and collapses with persistence and named destinations', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await screen.findByText('96 messages')
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }))
    expect(document.querySelector('.app-shell')).toHaveClass(
      'sidebar-collapsed',
    )
    for (const name of ['Inbox explorer', 'Insights', 'Settings'])
      expect(screen.getByRole('button', { name })).toHaveAttribute('title')
    first.unmount()
    render(<App />)
    expect(
      screen.getByRole('button', { name: 'Expand sidebar' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Expand sidebar' }))
    expect(document.querySelector('.app-shell')).toHaveClass('sidebar-expanded')
  })
})
