import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { mockGoogle } from './fixtures/google'
const key = 'inbox-intelligence.preferences'
for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`optional keyboard setup and returning preferences at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.route('https://**/*', (route) => route.abort())
    await page.goto('/')
    await expect(page.getByText('Demo processing complete')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Connect Gmail' }),
    ).toBeEnabled()
    expect(
      await page.evaluate(
        (storageKey) => localStorage.getItem(storageKey),
        key,
      ),
    ).toBeNull()
    const start = page.getByRole('button', { name: 'Set up your view' })
    await start.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('heading', { name: 'A little about your day' }),
    ).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('button', { name: 'Skip setup', exact: true }),
    ).toBeFocused()
    const student = page.getByRole('radio', { name: 'Student', exact: true })
    await student.focus()
    await page.keyboard.press('Space')
    await expect(student).toBeChecked()
    await page.keyboard.press('ArrowDown')
    await expect(
      page.getByRole('radio', { name: 'Working professional' }),
    ).toBeChecked()
    await page.keyboard.press('ArrowUp')
    await expect(student).toBeChecked()
    const continueButton = page.getByRole('button', {
      name: 'Continue',
      exact: true,
    })
    await continueButton.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('heading', { name: 'What would you like to focus on?' }),
    ).toBeFocused()
    const finance = page.getByRole('checkbox', {
      name: 'Organize financial notifications',
    })
    await finance.focus()
    await page.keyboard.press('Space')
    await expect(finance).toBeChecked()
    await continueButton.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('checkbox', { name: 'Finance', exact: true }),
    ).toBeChecked()
    await expect(
      page.getByRole('checkbox', { name: 'Education', exact: true }),
    ).toHaveCount(0)
    const orders = page.getByRole('checkbox', { name: 'Orders', exact: true })
    await orders.focus()
    await page.keyboard.press('Space')
    await expect(orders).not.toBeChecked()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await mkdir('output/playwright', { recursive: true })
    await page.screenshot({
      path: `output/playwright/phase3a-review-${viewport.width}.png`,
      fullPage: true,
    })
    const save = page.getByRole('button', {
      name: 'Confirm and save preferences',
    })
    await save.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('heading', { name: 'Your focus', exact: true }),
    ).toBeVisible()
    const stored = await page.evaluate(
      (storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? 'null'),
      key,
    )
    expect(stored).toEqual({
      schemaVersion: 1,
      status: 'completed',
      profile: 'student',
      goals: ['finance'],
      enabledCategories: ['Finance'],
    })
    await page.reload()
    await expect(
      page.getByRole('heading', { name: 'Your focus', exact: true }),
    ).toBeVisible()
    await expect(
      page.getByRole('region', { name: 'Personalized setup' }),
    ).toHaveCount(0)
    await page
      .getByRole('button', { name: 'Inbox explorer', exact: true })
      .click()
    await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
    await page.getByLabel('Category', { exact: true }).selectOption('Education')
    await expect(page.getByText('12 messages', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await page.getByRole('button', { name: 'Clear preferences' }).click()
    expect(
      await page.evaluate(
        (storageKey) => localStorage.getItem(storageKey),
        key,
      ),
    ).toBeNull()
    await expect(
      page.getByRole('button', { name: 'Set up your view' }),
    ).toBeEnabled()
  })
}
test('skip persists without forcing a profile; no Google requests on reload', async ({
  page,
}) => {
  const external: string[] = []
  await page.route('https://**/*', async (route) => {
    external.push(new URL(route.request().url()).origin)
    await route.abort()
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Skip setup', exact: true }).click()
  await expect(page.getByText(/Setup skipped/)).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole('button', { name: 'Skip setup', exact: true }),
  ).toHaveCount(0)
  expect(
    await page.evaluate(
      (storageKey) => JSON.parse(localStorage.getItem(storageKey) ?? 'null'),
      key,
    ),
  ).toEqual({
    schemaVersion: 1,
    status: 'skipped',
    profile: null,
    goals: [],
    enabledCategories: [],
  })
  expect(external).toEqual([])
})
test('invalid storage is ignored safely and reset preserves unrelated values', async ({
  page,
}) => {
  await page.addInitScript((storageKey) => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ schemaVersion: 99, token: 'synthetic-private-data' }),
    )
    localStorage.setItem('unrelated-setting', 'keep')
  }, key)
  await page.route('https://**/*', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText('Demo processing complete')).toBeVisible()
  await expect(page.getByText(/invalid or unsupported/)).not.toContainText(
    'synthetic-private-data',
  )
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Clear preferences' }).click()
  expect(
    await page.evaluate(
      (storageKey) => ({
        own: localStorage.getItem(storageKey),
        other: localStorage.getItem('unrelated-setting'),
      }),
      key,
    ),
  ).toEqual({ own: null, other: 'keep' })
})
test('blocked storage leaves setup and dashboard usable with honest notices', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('synthetic private failure', 'SecurityError')
      },
    }),
  )
  await page.route('https://**/*', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText('Demo processing complete')).toBeVisible()
  await expect(page.getByText(/could not be read/)).toBeVisible()
  await page.getByRole('button', { name: 'Set up your view' }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('button', { name: 'Confirm and save preferences' })
    .click()
  await expect(page.getByText(/Applied for this tab/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Connect Gmail' }),
  ).toBeEnabled()
})
test('saving and resetting preferences preserve Gmail state and request counts', async ({
  page,
}) => {
  const { requests, writes } = await mockGoogle(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Connect Gmail' }).click()
  await page.getByRole('button', { name: 'Authorize Gmail' }).click()
  await expect(page.getByText('Gmail sample processing complete')).toBeVisible()
  const baseline = requests.length
  await page.getByRole('button', { name: 'Set up your view' }).click()
  await page.getByLabel('Student', { exact: true }).check()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page
    .getByRole('button', { name: 'Confirm and save preferences' })
    .click()
  await expect(page.locator('.app-shell')).toHaveAttribute(
    'data-retained-live-message-count',
    '2',
  )
  expect(requests).toHaveLength(baseline)
  const stored = await page.evaluate(
    (storageKey) => localStorage.getItem(storageKey),
    key,
  )
  expect(stored).not.toMatch(
    /browser-test-token|sender@example.test|Interview invitation|recent|older/,
  )
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByRole('button', { name: 'Clear preferences' }).click()
  await expect(
    page.getByRole('button', { name: 'Disconnect Gmail / use mock' }),
  ).toBeEnabled()
  await expect(page.locator('.app-shell')).toHaveAttribute(
    'data-retained-live-message-count',
    '2',
  )
  expect(requests).toHaveLength(baseline)
  await page
    .getByRole('button', { name: 'Disconnect Gmail / use mock' })
    .click()
  await expect(page.locator('.app-shell')).toHaveAttribute(
    'data-retained-live-message-count',
    '0',
  )
  await expect(
    page.getByRole('button', { name: 'Connect Gmail' }),
  ).toBeEnabled()
  expect(writes).toEqual([])
})
