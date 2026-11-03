import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { App } from '../app/App'
import { StatusPanel } from '../components/common/StatusPanel'
describe('important UI workflows', () => {
  it('explores messages, combines filters, and recovers from no results', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(
      await screen.findByText('Demo processing complete'),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Inbox explorer/ }))
    await user.type(
      screen.getByRole('textbox', { name: 'Search messages' }),
      'interview',
    )
    expect(screen.getByText('6 messages')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Category'), 'Orders')
    expect(
      screen.getByRole('heading', { name: 'No messages found' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByText('96 messages')).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    expect(screen.getByText('30 messages')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Refresh demo' }))
    expect(await screen.findByText('30 messages')).toBeInTheDocument()
  })
  it('navigates analytics and honest connection settings', async () => {
    const user = userEvent.setup()
    render(<App />)
    await screen.findByText('Demo processing complete')
    await user.click(screen.getByRole('button', { name: 'Analytics' }))
    expect(
      screen.getByRole('heading', { name: 'Inbox rhythm' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Settings' }))
    expect(screen.getByRole('button', { name: 'Connect Gmail' })).toBeEnabled()
    expect(screen.getByText('Gmail connection')).toBeInTheDocument()
  })
  it('exposes recoverable errors and handles an empty repository', async () => {
    const broken = {
      list: async () => {
        throw new Error('sensitive payload')
      },
    }
    const { unmount } = render(<App emailRepository={broken} />)
    expect(await screen.findByRole('alert')).not.toHaveTextContent(
      'sensitive payload',
    )
    expect(
      within(screen.getByRole('alert')).getByRole('button', {
        name: 'Try again',
      }),
    ).toBeEnabled()
    unmount()
    const user = userEvent.setup()
    render(<App emailRepository={{ list: async () => [] }} />)
    await waitFor(() =>
      expect(screen.getByText('Demo processing complete')).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: /Inbox explorer/ }))
    expect(
      screen.getByRole('heading', { name: 'No messages found' }),
    ).toBeInTheDocument()
  })
  it('announces reusable loading state', () => {
    render(
      <StatusPanel title="Loading messages" description="Preparing metadata" />,
    )
    expect(screen.getByRole('status')).toHaveTextContent('Loading messages')
  })
})
