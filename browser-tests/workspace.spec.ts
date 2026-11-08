import {
  navigation,
  source,
  filters,
  display,
} from './fixtures/workspaceControls'
import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { mockGoogle } from './fixtures/google'
import { textContrastFailures } from './fixtures/contrast'
const displayKey = 'inbox-intelligence.workspace'
test('inbox-first search, density, split reading and keyboard context at desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('https://**/*', (route) => route.abort())
  await page.goto('/app')
  await expect(
    page.getByRole('heading', { name: 'Inbox', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
  expect(
    await page.evaluate((key) => localStorage.getItem(key), displayKey),
  ).toBeNull()
  const row = page.locator('.mail-row').first()
  const comfortable = await row.boundingBox()
  await mkdir('output/playwright', { recursive: true })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: 'output/playwright/workspace-after-desktop-viewport.png',
  })
  await page.screenshot({
    path: 'output/playwright/workspace-after-desktop.png',
    fullPage: true,
  })
  await display(page)
  await page
    .getByLabel('Display density', { exact: true })
    .selectOption('compact')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Inbox explorer', exact: true })
    .click()
  const compact = await row.boundingBox()
  expect(compact?.height).toBeLessThan(comfortable?.height ?? 0)
  await display(page)
  await page.getByLabel('Reading layout', { exact: true }).selectOption('split')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Inbox explorer', exact: true })
    .click()
  await row.focus()
  await page.keyboard.press('Enter')
  const pane = page.getByRole('region', { name: 'Message reading pane' })
  await expect(
    pane.getByRole('heading', { name: 'Why this category?' }),
  ).toBeVisible()
  await expect(pane.locator('#detail-title')).toBeFocused()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: 'output/playwright/workspace-after-split-viewport.png',
  })
  await page.screenshot({
    path: 'output/playwright/workspace-after-split.png',
    fullPage: true,
  })
  expect(await textContrastFailures(page)).toEqual([])
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Insights', exact: true })
    .click()
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Message reading pane' }),
  ).toHaveCount(0)
  await page.goBack()
  await expect(
    page
      .getByRole('region', { name: 'Message reading pane' })
      .locator('#detail-title'),
  ).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(row).toBeFocused()
  await page.locator('#main-content').focus()
  await page.keyboard.press('/')
  await expect(
    page.getByRole('textbox', { name: 'Search messages' }),
  ).toBeFocused()
  await page.getByRole('textbox', { name: 'Search messages' }).fill('INTERVIEW')
  await (
    await filters(page)
  )
    .getByLabel('Category', { exact: true })
    .selectOption('Jobs and internships')
  await (
    await filters(page)
  )
    .getByLabel('Priority', { exact: true })
    .selectOption('High')
  await expect(page.getByText('6 messages', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await page.goto('/app/overview')
  await expect(page).toHaveURL('/app/overview')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Insights', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Inbox rhythm' }),
  ).toBeVisible()
  await page.goBack()
  await expect(
    page.getByRole('heading', { name: 'Insights', exact: true }),
  ).toBeVisible()
})
test('mobile dialog fallback, density and configurable default preserve onboarding', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.route('https://**/*', (route) => route.abort())
  await page.goto('/app')
  const initialRow = await page.locator('.mail-row').first().boundingBox()
  expect(initialRow?.y).toBeLessThan(844)
  await page.getByRole('button', { name: 'Skip setup', exact: true }).click()
  const profile = await page.evaluate(() =>
    localStorage.getItem('inbox-intelligence.preferences'),
  )
  await display(page)
  await page.getByLabel('Reading layout', { exact: true }).selectOption('split')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Inbox explorer', exact: true })
    .click()
  await expect(
    page.getByRole('region', { name: 'Message reading pane' }),
  ).toHaveCount(0)
  const row = page.locator('.mail-row').first()
  await row.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page
      .getByRole('dialog')
      .getByRole('heading', { name: 'Why this category?' }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(row).toBeFocused()
  await display(page)
  await page
    .getByLabel('Display density', { exact: true })
    .selectOption('compact')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Inbox explorer', exact: true })
    .click()
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true)
  await display(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({
    path: 'output/playwright/workspace-after-mobile-viewport.png',
  })
  await page.screenshot({
    path: 'output/playwright/workspace-after-mobile.png',
    fullPage: true,
  })
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Settings', exact: true })
    .click()
  await page
    .getByLabel('Default workspace', { exact: true })
    .selectOption('Analytics')
  await page.goto('/app')
  await expect(
    page.getByRole('heading', { name: 'Inbox rhythm' }),
  ).toBeVisible()
  await page.goto('/app/inbox')
  await expect(
    page.getByRole('heading', { name: 'Inbox', exact: true }),
  ).toBeVisible()
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Settings', exact: true })
    .click()
  await page.getByRole('button', { name: 'Restart onboarding' }).click()
  await expect(
    page.getByRole('heading', { name: 'A little about your day' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Skip setup', exact: true }).click()
  await page.getByRole('button', { name: 'Reset display preferences' }).click()
  expect(
    await page.evaluate(() =>
      localStorage.getItem('inbox-intelligence.preferences'),
    ),
  ).toBe(profile)
  await page.goto('/app')
  await expect(
    page.getByRole('heading', { name: 'Inbox', exact: true }),
  ).toBeVisible()
})
test('Gmail split pane reads only existing metadata and display changes never request more mail', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  const { requests, writes } = await mockGoogle(page)
  await page.goto('/app')
  await (
    await source(page)
  )
    .getByRole('button', { name: 'Connect Gmail' })
    .click()
  await page.getByRole('button', { name: 'Authorize Gmail' }).click()
  await expect(
    page.getByText(/2 of 3 selected messages loaded; 1 failed/),
  ).toBeVisible()
  const count = requests.length
  await display(page)
  await page.getByLabel('Reading layout', { exact: true }).selectOption('split')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Inbox explorer', exact: true })
    .click()
  await display(page)
  await page
    .getByLabel('Display density', { exact: true })
    .selectOption('compact')
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Inbox explorer', exact: true })
    .click()
  await page.locator('.mail-row').first().click()
  const pane = page.getByRole('region', { name: 'Message reading pane' })
  await expect(pane).toContainText(
    'Message bodies and attachments are not retrieved',
  )
  await page.getByRole('textbox', { name: 'Search messages' }).fill('Interview')
  expect(requests).toHaveLength(count)
  expect(writes).toEqual([])
  for (const url of requests.filter(
    (url) => !url.pathname.endsWith('/messages'),
  ))
    expect(url.searchParams.get('format')).toBe('METADATA')
  const stored = await page.evaluate(
    (key) => localStorage.getItem(key),
    displayKey,
  )
  expect(stored).not.toMatch(
    /browser-test-token|sender@example.test|Interview invitation|recent|older/,
  )
  await (
    await source(page)
  )
    .getByRole('button', { name: 'Disconnect Gmail / use mock' })
    .click()
  await expect(page.locator('.app-shell')).toHaveAttribute(
    'data-retained-live-message-count',
    '0',
  )
  await expect(pane).toHaveCount(0)
  await expect(
    (await source(page)).getByRole('button', { name: 'Connect Gmail' }),
  ).toBeEnabled()
})
