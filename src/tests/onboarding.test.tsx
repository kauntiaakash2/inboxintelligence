import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { App } from '../app/App'
import {
  PreferenceStore,
  PREFERENCE_STORAGE_KEY,
} from '../repositories/preferenceStore'
import { GmailAuthorization } from '../services/gmailAuthorization'
import { fakeGoogle, gmailMetadata, jsonResponse } from './googleFixtures'
import type { UserPreferences } from '../domain/preferences'
async function openSetup(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Set up your view' }))
}
async function continueStep(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Continue' }))
}
async function finish(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole('button', { name: 'Confirm and save preferences' }),
  )
}
describe('optional first-run and returning setup', () => {
  it('keeps the dashboard and connection available without an automatic storage write', async () => {
    render(<App />)
    await screen.findByText('Demo processing complete')
    expect(
      screen.getByRole('button', { name: 'Set up your view' }),
    ).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Connect Gmail' })).toBeEnabled()
    expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).toBeNull()
  })
  it('completes with no role or goals and allows all category suggestions to be off', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openSetup(user)
    expect(
      screen.getByRole('heading', { name: 'A little about your day' }),
    ).toHaveFocus()
    await continueStep(user)
    await continueStep(user)
    expect(screen.getByText(/affect display order/)).toBeInTheDocument()
    for (const checkbox of screen.getAllByRole('checkbox'))
      await user.click(checkbox)
    await finish(user)
    expect(screen.getByText(/All focus categories are off/)).toBeInTheDocument()
    expect(
      JSON.parse(localStorage.getItem(PREFERENCE_STORAGE_KEY)!),
    ).toMatchObject({
      profile: null,
      goals: [],
      enabledCategories: [],
      status: 'completed',
    })
  })
  it('uses declared goals over role defaults and persists edited suggestions for returning users', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await openSetup(user)
    await user.click(screen.getByLabelText('Student'))
    await continueStep(user)
    await user.click(screen.getByLabelText('Organize financial notifications'))
    await continueStep(user)
    expect(screen.getByLabelText('Finance')).toBeChecked()
    expect(screen.queryByLabelText('Education')).not.toBeInTheDocument()
    await user.click(screen.getByLabelText('Orders'))
    await user.click(screen.getByRole('button', { name: 'Back' }))
    await continueStep(user)
    expect(screen.getByLabelText('Orders')).not.toBeChecked()
    await finish(user)
    const saved = JSON.parse(
      localStorage.getItem(PREFERENCE_STORAGE_KEY)!,
    ) as UserPreferences
    expect(saved).toMatchObject({
      profile: 'student',
      goals: ['finance'],
      enabledCategories: ['Finance'],
    })
    unmount()
    render(<App />)
    await screen.findByText('Demo processing complete')
    expect(
      screen.getByRole('heading', { name: 'Your focus' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('list', { name: 'Enabled focus categories' }),
    ).toHaveTextContent('Finance')
    await user.click(screen.getByRole('button', { name: /Inbox explorer/ }))
    expect(screen.getByText('96 messages')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Category'), 'Education')
    expect(screen.getByText('12 messages')).toBeInTheDocument()
  })
  it('skips and remembers dismissal, then resets only preferences from settings', async () => {
    localStorage.setItem('unrelated-setting', 'keep')
    try {
      const user = userEvent.setup()
      const { unmount } = render(<App />)
      await user.click(screen.getByRole('button', { name: 'Skip setup' }))
      expect(screen.getByText(/Setup skipped/)).toBeInTheDocument()
      unmount()
      render(<App />)
      expect(
        screen.queryByRole('button', { name: 'Skip setup' }),
      ).not.toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Settings' }))
      await user.click(
        screen.getByRole('button', { name: 'Clear preferences' }),
      )
      expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).toBeNull()
      expect(localStorage.getItem('unrelated-setting')).toBe('keep')
      expect(
        screen.getByRole('button', { name: 'Set up your view' }),
      ).toBeEnabled()
    } finally {
      localStorage.removeItem('unrelated-setting')
    }
  })
  it('supports profile/goal/category editing and cancel preserves saved preferences', async () => {
    const user = userEvent.setup()
    render(<App />)
    await openSetup(user)
    await user.click(screen.getByLabelText('Prefer not to say'))
    await continueStep(user)
    await continueStep(user)
    await finish(user)
    const before = localStorage.getItem(PREFERENCE_STORAGE_KEY)
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.click(screen.getByRole('button', { name: 'Change profile' }))
    await user.click(screen.getByLabelText('Working professional'))
    await user.click(screen.getByRole('button', { name: 'Skip setup' }))
    expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).toBe(before)
    await user.click(screen.getByRole('button', { name: 'Change goals' }))
    expect(
      screen.getByRole('group', { name: 'Choose your goals (optional)' }),
    ).toBeInTheDocument()
    await user.click(screen.getByLabelText('Track deadlines'))
    await continueStep(user)
    await finish(user)
    await user.click(
      screen.getByRole('button', { name: 'Manage suggested categories' }),
    )
    expect(screen.getByLabelText('Events and deadlines')).toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Skip setup' }))
    await user.click(screen.getByRole('button', { name: 'Restart onboarding' }))
    await user.click(
      screen.getByRole('button', { name: 'Leave profile blank' }),
    )
    expect(screen.getByLabelText('Prefer not to say')).not.toBeChecked()
    await user.click(screen.getByRole('button', { name: 'Skip setup' }))
  })
  it('shows safe defaults for invalid stored preferences without blocking dashboard', async () => {
    localStorage.setItem(
      PREFERENCE_STORAGE_KEY,
      JSON.stringify({ schemaVersion: 99, token: 'synthetic-private-value' }),
    )
    render(<App />)
    await screen.findByText('Demo processing complete')
    expect(screen.getByText(/invalid or unsupported/)).not.toHaveTextContent(
      'synthetic-private-value',
    )
    expect(screen.getByRole('button', { name: 'Connect Gmail' })).toBeEnabled()
  })
  it('remains usable when reading, saving and clearing browser storage fail', async () => {
    const store = new PreferenceStore(() => {
      throw new Error('private failure')
    })
    const user = userEvent.setup()
    render(<App preferenceStore={store} />)
    await screen.findByText('Demo processing complete')
    expect(screen.getByText(/could not be read/)).not.toHaveTextContent(
      'private failure',
    )
    await openSetup(user)
    await continueStep(user)
    await continueStep(user)
    await finish(user)
    expect(screen.getByText(/Applied for this tab/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    await user.click(screen.getByRole('button', { name: 'Clear preferences' }))
    expect(screen.getByText(/may return after reload/)).toBeInTheDocument()
  })
  it('preserves an active Gmail grant and loaded state while preferences change', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ messages: [{ id: 'test-message' }] }),
      )
      .mockResolvedValueOnce(jsonResponse(gmailMetadata('test-message')))
    vi.stubGlobal('fetch', fetcher)
    try {
      const google = fakeGoogle()
      const auth = new GmailAuthorization({
        clientId: 'test-client',
        load: async () => google.provider,
      })
      const user = userEvent.setup()
      render(<App authorization={auth} />)
      await screen.findByText('Demo processing complete')
      await user.click(screen.getByRole('button', { name: 'Connect Gmail' }))
      await user.click(
        await screen.findByRole('button', { name: 'Authorize Gmail' }),
      )
      act(() => google.grant())
      await screen.findByText('Gmail sample processing complete')
      const calls = fetcher.mock.calls.length
      await openSetup(user)
      await user.click(screen.getByLabelText('Freelancer/business owner'))
      await continueStep(user)
      await continueStep(user)
      await finish(user)
      expect(auth.getSnapshot().status).toBe('connected')
      expect(fetcher).toHaveBeenCalledTimes(calls)
      expect(google.provider.revoke).not.toHaveBeenCalled()
      expect(document.querySelector('.app-shell')).toHaveAttribute(
        'data-retained-live-message-count',
        '1',
      )
      expect(localStorage.getItem(PREFERENCE_STORAGE_KEY)).not.toMatch(
        /test-only-token|test-message|sender@example.test|Interview invitation/,
      )
      await user.click(
        screen.getByRole('button', { name: 'Disconnect Gmail / use mock' }),
      )
      await screen.findByText('Demo processing complete')
      expect(
        screen.getByRole('heading', { name: 'Your focus' }),
      ).toBeInTheDocument()
      expect(document.querySelector('.app-shell')).toHaveAttribute(
        'data-retained-live-message-count',
        '0',
      )
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
