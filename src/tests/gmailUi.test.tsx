import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '../app/App'
import { GmailAuthorization } from '../services/gmailAuthorization'
import { fakeGoogle, gmailMetadata, jsonResponse } from './googleFixtures'
afterEach(() => vi.unstubAllGlobals())
async function start(fetcher: typeof fetch) {
  vi.stubGlobal('fetch', fetcher)
  const google = fakeGoogle()
  const authorization = new GmailAuthorization({
    clientId: 'public-test-client',
    load: async () => google.provider,
  })
  const user = userEvent.setup()
  const rendered = render(<App authorization={authorization} />)
  await screen.findByText('Demo processing complete')
  document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open = true
  expect(fetcher).not.toHaveBeenCalled()
  await user.click(screen.getByRole('button', { name: 'Connect Gmail' }))
  await user.click(
    await screen.findByRole('button', { name: 'Authorize Gmail' }),
  )
  act(() => google.grant())
  return { user, google, authorization, ...rendered }
}
describe('mock/live source lifecycle', () => {
  it('shows real-source metadata summaries and returns safely to mock on disconnect', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ messages: [{ id: 'one' }], nextPageToken: 'next' }),
      )
      .mockResolvedValueOnce(jsonResponse({}))
      .mockResolvedValueOnce(jsonResponse(gmailMetadata('one')))
    const { user, google } = await start(fetcher)
    await screen.findByText('Gmail sample processing complete')
    expect(
      screen.getByText(/1 of 1 selected messages loaded/),
    ).toHaveTextContent('Spam and Trash excluded')
    expect(screen.getAllByText('Live Gmail sample').length).toBeGreaterThan(0)
    await user.click(screen.getByRole('button', { name: /Inbox explorer/ }))
    expect(screen.getByText('Interview invitation')).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Disconnect Gmail / use mock' }),
    )
    await screen.findByText('96 messages')
    expect(screen.queryByText('Interview invitation')).not.toBeInTheDocument()
    expect(google.provider.revoke).toHaveBeenCalled()
    expect(document.querySelector('.app-shell')).toHaveAttribute(
      'data-retained-live-message-count',
      '0',
    )
    expect(
      screen.queryByRole('region', { name: 'Gmail aggregate diagnostics' }),
    ).not.toBeInTheDocument()
    expect(localStorage.length).toBe(0)
    expect(sessionStorage.length).toBe(0)
  })
  it('displays empty and partial-failure Gmail samples honestly', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ messages: [{ id: 'one' }, { id: 'bad' }] }),
      )
      .mockImplementation(async (input) =>
        jsonResponse(
          String(input).includes('/one?')
            ? gmailMetadata('one')
            : { id: 'bad' },
        ),
      )
    const { user } = await start(fetcher)
    await screen.findByText('Gmail sample processing complete')
    expect(
      screen.getByText(/1 of 2 selected messages loaded; 1 failed/),
    ).toBeInTheDocument()
    fetcher.mockResolvedValue(jsonResponse({}))
    await user.click(screen.getByRole('button', { name: 'Refresh Gmail' }))
    await waitFor(() =>
      expect(
        screen.getByText(/0 of 0 selected messages loaded/),
      ).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: /Inbox explorer/ }))
    expect(
      screen.getByRole('heading', { name: 'No messages found' }),
    ).toBeInTheDocument()
  })
  it('recovers failed metadata on explicit refresh and reports content-free request counts', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        jsonResponse({ messages: [{ id: 'one' }, { id: 'two' }] }),
      )
      .mockImplementation(async (input) =>
        jsonResponse(
          String(input).includes('/one?')
            ? gmailMetadata('one')
            : { id: 'two' },
        ),
      )
    const { user } = await start(fetcher)
    await screen.findByText('Gmail sample processing complete')
    expect(
      screen.getByText(/1 of 2 selected messages loaded; 1 failed/),
    ).toBeInTheDocument()
    const diagnostics = screen.getByRole('region', {
      name: 'Gmail aggregate diagnostics',
    })
    expect(diagnostics).toHaveTextContent('API request attempts3')
    expect(diagnostics).not.toHaveTextContent('test-only-token')
    expect(diagnostics).not.toHaveTextContent('sender@example.test')
    expect(diagnostics).not.toHaveTextContent('Interview invitation')
    fetcher.mockImplementation(async (input) =>
      String(input).includes('/messages?')
        ? jsonResponse({ messages: [{ id: 'one' }, { id: 'two' }] })
        : jsonResponse(
            gmailMetadata(new URL(String(input)).pathname.split('/').at(-1)),
          ),
    )
    await user.click(screen.getByRole('button', { name: 'Refresh Gmail' }))
    await screen.findByText(/2 of 2 selected messages loaded; 0 failed/)
    expect(document.querySelector('.app-shell')).toHaveAttribute(
      'data-retained-live-message-count',
      '2',
    )
  })
  it('clears private results on revoked access rather than silently reconnecting', async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ messages: [{ id: 'one' }] }))
      .mockResolvedValueOnce(jsonResponse(gmailMetadata('one')))
    const { user, google } = await start(fetcher)
    await screen.findByText('Gmail sample processing complete')
    fetcher.mockResolvedValue(jsonResponse({ error: 'private' }, 401))
    await user.click(screen.getByRole('button', { name: 'Refresh Gmail' }))
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    expect(screen.getByRole('alert')).toHaveTextContent(
      'expired or was revoked',
    )
    expect(google.provider.initTokenClient).toHaveBeenCalledTimes(1)
  })
  it('disconnects in-flight discovery and ignores late results', async () => {
    let resolve!: (response: Response) => void
    const fetcher = vi.fn<typeof fetch>().mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done
        }),
    )
    const { user } = await start(fetcher)
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1))
    await user.click(
      screen.getByRole('button', { name: 'Disconnect Gmail / use mock' }),
    )
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    await act(async () => {
      resolve(jsonResponse({ messages: [{ id: 'late' }] }))
      await Promise.resolve()
    })
    expect(
      screen.queryByText('Gmail sample processing complete'),
    ).not.toBeInTheDocument()
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('keeps mock mode on denial and missing scope without API calls', async () => {
    const google = fakeGoogle()
    const authorization = new GmailAuthorization({
      clientId: 'test',
      load: async () => google.provider,
    })
    const fetcher = vi.fn<typeof fetch>()
    vi.stubGlobal('fetch', fetcher)
    const user = userEvent.setup()
    render(<App authorization={authorization} />)
    await screen.findByText('Demo processing complete')
    document.querySelector<HTMLDetailsElement>('.source-disclosure')!.open =
      true
    await user.click(screen.getByRole('button', { name: 'Connect Gmail' }))
    await user.click(
      await screen.findByRole('button', { name: 'Authorize Gmail' }),
    )
    act(() => google.grant({ scope: 'other' }))
    expect(screen.getByRole('alert')).toHaveTextContent(
      'permission was not granted',
    )
    expect(screen.getByText('Demo processing complete')).toBeInTheDocument()
    expect(fetcher).not.toHaveBeenCalled()
  })
})
