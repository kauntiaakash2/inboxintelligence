import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
async function mockGoogle(
  page: Page,
  outcome:
    'success' | 'denied' | 'missing' | 'cancelled' | 'unauthorized' = 'success',
) {
  const requests: URL[] = []
  const writes: string[] = []
  await page.route('https://**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    if (url.href === 'https://accounts.google.com/gsi/client') {
      await route.fulfill({
        contentType: 'application/javascript',
        body: `window.google={accounts:{oauth2:{initTokenClient(config){return {requestAccessToken(){${outcome === 'denied' ? "config.callback({error:'access_denied',error_description:'private error'});" : outcome === 'cancelled' ? "config.error_callback({type:'popup_closed'});" : `config.callback({access_token:'browser-test-token',token_type:'Bearer',expires_in:3600,scope:${JSON.stringify(outcome === 'missing' ? 'other' : 'https://www.googleapis.com/auth/gmail.readonly')}});`}}}},hasGrantedAllScopes(response,scope){return response.scope===scope},revoke(token,done){window.__testRevoked=true;done({successful:true})}}}}`,
      })
      return
    }
    if (url.origin === 'https://gmail.googleapis.com') {
      requests.push(url)
      if (request.method() !== 'GET') {
        writes.push(request.method())
        await route.abort()
        return
      }
      if (outcome === 'unauthorized') {
        await route.fulfill({
          status: 401,
          json: { error: { message: 'private error' } },
        })
        return
      }
      if (url.pathname.endsWith('/messages')) {
        await route.fulfill({
          json: url.searchParams.has('pageToken')
            ? { messages: [{ id: 'broken' }] }
            : {
                messages: [{ id: 'recent' }, { id: 'older' }],
                nextPageToken: 'next',
              },
        })
        return
      }
      expect(url.searchParams.get('format')).toBe('METADATA')
      expect(url.searchParams.get('fields')).not.toMatch(
        /body|snippet|attachment/,
      )
      const id = url.pathname.split('/').at(-1)
      await route.fulfill({
        json:
          id === 'broken'
            ? { id }
            : {
                id,
                internalDate:
                  id === 'recent' ? '1793606400000' : '1793520000000',
                labelIds: ['INBOX', 'UNREAD'],
                payload: {
                  headers: [
                    {
                      name: 'From',
                      value: 'Synthetic Browser Sender <sender@example.test>',
                    },
                    {
                      name: 'Subject',
                      value:
                        id === 'recent'
                          ? 'Interview invitation'
                          : 'Course update',
                    },
                  ],
                },
              },
      })
      return
    }
    await route.abort()
  })
  return { requests, writes }
}
async function connect(page: Page) {
  await page.getByRole('button', { name: 'Connect Gmail' }).click()
  await page.getByRole('button', { name: 'Authorize Gmail' }).click()
}
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`mocked Gmail sample, metadata detail and disconnect at ${viewport.width}px`, async ({
    page,
  }) => {
    await mkdir('output/playwright', { recursive: true })
    await page.setViewportSize(viewport)
    const { requests, writes } = await mockGoogle(page)
    await page.goto('/')
    await expect(page.getByText('Demo processing complete')).toBeVisible()
    expect(requests).toHaveLength(0)
    expect(
      await page
        .locator('script[src="https://accounts.google.com/gsi/client"]')
        .count(),
    ).toBe(0)
    await connect(page)
    await expect(
      page.getByText('Gmail sample processing complete'),
    ).toBeVisible()
    await expect(
      page.getByText(/2 of 3 selected messages loaded; 1 failed/),
    ).toBeVisible()
    await expect(
      page.getByText('Live Gmail sample', { exact: true }),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.screenshot({
      path: `output/playwright/phase2-live-${viewport.width}.png`,
      fullPage: true,
    })
    await page.getByRole('button', { name: /Inbox explorer/ }).click()
    await page.locator('.message-row').first().click()
    await expect(page.getByRole('dialog')).toContainText(
      'Message bodies and attachments are not retrieved',
    )
    await page.screenshot({
      path: `output/playwright/phase2-detail-${viewport.width}.png`,
    })
    await page.keyboard.press('Escape')
    await expect(page.locator('.app-shell')).toHaveAttribute(
      'data-retained-live-message-count',
      '2',
    )
    await expect(
      page.getByRole('region', { name: 'Gmail aggregate diagnostics' }),
    ).toContainText('API request attempts5')
    expect(
      await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
      })),
    ).toEqual({ local: 0, session: 0 })
    await page
      .getByRole('button', { name: 'Disconnect Gmail / use mock' })
      .click()
    await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Interview invitation', { exact: true }),
    ).not.toBeVisible()
    expect(
      await page.evaluate(() => Reflect.get(window, '__testRevoked')),
    ).toBe(true)
    await expect(page.locator('.app-shell')).toHaveAttribute(
      'data-retained-live-message-count',
      '0',
    )
    await expect(
      page.getByRole('region', { name: 'Gmail aggregate diagnostics' }),
    ).not.toBeVisible()
    expect(writes).toEqual([])
    expect(
      requests.filter((url) => url.pathname.endsWith('/messages')),
    ).toHaveLength(2)
    for (const url of requests.filter((url) =>
      url.pathname.endsWith('/messages'),
    ))
      expect(url.searchParams.get('includeSpamTrash')).toBe('false')
    const count = requests.length
    await page.reload()
    await expect(page.getByText('Demo processing complete')).toBeVisible()
    expect(requests).toHaveLength(count)
  })
}
for (const outcome of [
  'denied',
  'missing',
  'cancelled',
  'unauthorized',
] as const) {
  test(`mocked ${outcome} keeps or restores mock mode`, async ({ page }) => {
    const { requests, writes } = await mockGoogle(page, outcome)
    await page.goto('/')
    await expect(page.getByText('Demo processing complete')).toBeVisible()
    await connect(page)
    await expect(page.getByRole('alert')).toBeVisible()
    await expect(page.getByText('Demo processing complete')).toBeVisible()
    await expect(page.getByRole('alert')).not.toContainText('private error')
    expect(writes).toEqual([])
    if (outcome !== 'unauthorized') expect(requests).toHaveLength(0)
  })
}
