import { act, render, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LandingPage } from '../features/landing/LandingPage'
import { Entry } from '../app/Entry'
import {
  isDashboardPath,
  useDashboardNavigation,
  viewFromPath,
  viewPaths,
} from '../app/useDashboardNavigation'
import { readFileSync } from 'node:fs'
const tokens = readFileSync('src/styles/tokens.css', 'utf8')

describe('public landing boundary and controls', () => {
  it('renders honest product sections and links without reading preferences or requesting Google', () => {
    const storage = vi.spyOn(Storage.prototype, 'getItem')
    const fetcher = vi.spyOn(globalThis, 'fetch')
    try {
      render(<LandingPage />)
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Understand your inbox.',
      )
      expect(screen.getByRole('link', { name: 'Open app' })).toHaveAttribute(
        'href',
        '/app',
      )
      const nav = screen.getByRole('navigation', { name: 'Public navigation' })
      for (const name of ['Features', 'How it works', 'Privacy', 'FAQ'])
        expect(within(nav).getByRole('link', { name })).toHaveAttribute(
          'href',
          expect.stringMatching(/^#/),
        )
      expect(screen.getByText('Planned', { exact: true })).toBeInTheDocument()
      expect(
        screen.getByLabelText('Synthetic product preview'),
      ).toHaveTextContent('96 synthetic messages')
      expect(
        screen.queryByRole('button', { name: 'Connect Gmail' }),
      ).not.toBeInTheDocument()
      expect(storage).not.toHaveBeenCalled()
      expect(fetcher).not.toHaveBeenCalled()
    } finally {
      storage.mockRestore()
      fetcher.mockRestore()
    }
  })
  it('opens and dismisses responsive navigation using semantic controls', async () => {
    const user = userEvent.setup()
    render(<LandingPage />)
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    expect(
      screen.getByRole('button', { name: 'Close navigation' }),
    ).toHaveAttribute('aria-expanded', 'true')
    await user.click(
      within(
        screen.getByRole('navigation', { name: 'Public navigation' }),
      ).getByRole('link', { name: 'Privacy' }),
    )
    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveAttribute('aria-expanded', 'false')
    await user.click(screen.getByRole('button', { name: 'Open navigation' }))
    within(screen.getByRole('navigation', { name: 'Public navigation' }))
      .getByRole('link', { name: 'Features' })
      .focus()
    await user.keyboard('{Escape}')
    expect(
      screen.getByRole('button', { name: 'Open navigation' }),
    ).toHaveFocus()
  })
  it('renders an honest unknown-route recovery page', () => {
    window.history.replaceState(null, '', '/missing')
    render(<Entry />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'outside the inbox',
    )
    expect(screen.getByRole('link', { name: 'Open app' })).toHaveAttribute(
      'href',
      '/app',
    )
  })
})
describe('small dashboard navigation contract', () => {
  it.each(Object.entries(viewPaths))(
    'maps %s to an addressable route',
    (view, path) => {
      expect(isDashboardPath(path)).toBe(true)
      expect(isDashboardPath(path + '/')).toBe(true)
      expect(viewFromPath(path)).toBe(view)
    },
  )
  it('rejects unrelated paths without treating them as app routes', () => {
    expect(isDashboardPath('/application')).toBe(false)
    expect(isDashboardPath('/app/private')).toBe(false)
    expect(viewFromPath('/')).toBe('Overview')
  })
  it('pushes only public view names into history and responds to popstate', () => {
    window.history.replaceState(null, '', '/app/analytics')
    const { result } = renderHook(() => useDashboardNavigation())
    expect(result.current.view).toBe('Analytics')
    act(() => result.current.setView('Settings'))
    expect(window.location.pathname).toBe('/app/settings')
    expect(window.history.state).toBeNull()
    act(() => {
      window.history.replaceState(null, '', '/app/inbox')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.view).toBe('Inbox explorer')
  })
})
function luminance(hex: string) {
  const channels =
    hex
      .replace('#', '')
      .match(/../g)
      ?.map((value) => {
        const channel = parseInt(value, 16) / 255
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4
      }) ?? []
  return channels.reduce(
    (sum, value, index) => sum + value * ([0.2126, 0.7152, 0.0722][index] ?? 0),
    0,
  )
}
describe('semantic color contract', () => {
  const color = (name: string) => {
    const value = tokens.match(new RegExp(`--${name}: (#[0-9a-f]{6});`))?.[1]
    if (!value) throw new Error('Missing semantic token: ' + name)
    return value
  }
  const contrast = (a: string, b: string) => {
    const values = [luminance(color(a)), luminance(color(b))].sort(
      (x, y) => y - x,
    )
    return ((values[0] ?? 0) + 0.05) / ((values[1] ?? 0) + 0.05)
  }
  it('meets normal-text AA for primary, secondary, brand and semantic status pairs', () => {
    for (const background of [
      'page-bg',
      'surface',
      'surface-raised',
      'surface-hover',
      'selected-bg',
    ])
      for (const foreground of ['text-primary', 'text-secondary', 'brand'])
        expect(
          contrast(foreground, background),
          `${foreground}/${background}`,
        ).toBeGreaterThanOrEqual(4.5)
    for (const state of ['brand', 'brand-hover', 'brand-active'])
      expect(contrast('on-brand', state)).toBeGreaterThanOrEqual(4.5)
    for (const state of ['warning', 'error', 'success', 'info'])
      expect(contrast(state, state + '-bg')).toBeGreaterThanOrEqual(4.5)
  })
  it('distinguishes control boundaries, focus and every chart color from dark surfaces', () => {
    for (const token of [
      'border-control',
      'focus-ring',
      'chart-0',
      'chart-1',
      'chart-2',
      'chart-3',
      'chart-4',
    ])
      expect(contrast(token, 'surface-hover'), token).toBeGreaterThanOrEqual(3)
  })
})
