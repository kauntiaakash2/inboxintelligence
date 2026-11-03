import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
const output = 'output/playwright'
test('desktop workflows, safe rendering, network boundary and keyboard dialog', async ({
  page,
}) => {
  await mkdir(output, { recursive: true })
  await page.setViewportSize({ width: 1440, height: 1000 })
  const errors: string[] = []
  const external: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('request', (request) => {
    if (
      !request.url().startsWith('http://127.0.0.1:4101') &&
      !request.url().startsWith('data:')
    )
      external.push(request.url())
  })
  await page.goto('/')
  await expect(page.getByText('Demo processing complete')).toBeVisible()
  await page.screenshot({
    path: `${output}/desktop-overview.png`,
    fullPage: true,
  })
  await page.getByRole('button', { name: /Inbox explorer/ }).click()
  await page.getByRole('textbox', { name: 'Search messages' }).fill('INTERVIEW')
  await expect(page.getByText('6 messages', { exact: true })).toBeVisible()
  await page
    .getByLabel('Category', { exact: true })
    .selectOption('Jobs and internships')
  await page.getByLabel('Priority', { exact: true }).selectOption('High')
  await expect(page.getByText('6 messages', { exact: true })).toBeVisible()
  const firstMessage = page.locator('.message-row').first()
  await firstMessage.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Why this category?' }),
  ).toBeVisible()
  await expect(
    page.getByText('career-opportunity', { exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/heuristic, not probability/)).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Close message' }),
  ).toBeFocused()
  await page.keyboard.press('Tab')
  // Native modals may cycle through browser chrome; background page controls stay inert.
  expect(
    await page.evaluate(
      () =>
        Boolean(document.activeElement?.closest('dialog')) ||
        document.activeElement === document.body,
    ),
  ).toBe(true)
  expect(
    await page
      .getByRole('dialog')
      .evaluate((element) => element.matches(':modal')),
  ).toBe(true)
  await page.screenshot({ path: `${output}/message-detail.png` })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await expect(firstMessage).toBeFocused()
  await page.getByLabel('Category', { exact: true }).selectOption('Orders')
  await expect(
    page.getByRole('heading', { name: 'No messages found' }),
  ).toBeVisible()
  await page.screenshot({ path: `${output}/empty-state.png` })
  await page.getByRole('button', { name: 'Clear filters' }).click()
  await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
  await page
    .getByRole('textbox', { name: 'Search messages' })
    .fill('<img src=x onerror=alert(1)>')
  await expect(
    page.getByRole('heading', { name: 'No messages found' }),
  ).toBeVisible()
  expect(await page.locator('img').count()).toBe(0)
  await page.getByRole('button', { name: 'Analytics', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Inbox rhythm' }),
  ).toBeVisible()
  await page.screenshot({
    path: `${output}/desktop-analytics.png`,
    fullPage: true,
  })
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Connect Gmail' }),
  ).toBeEnabled()
  await page.screenshot({
    path: `${output}/desktop-settings.png`,
    fullPage: true,
  })
  expect(errors).toEqual([])
  expect(external).toEqual([])
})
test('mobile layouts, touch navigation and reduced motion', async ({
  page,
}) => {
  await mkdir(output, { recursive: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByText('Demo processing complete')).toBeVisible()
  const checkOverflow = async () =>
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true)
  await checkOverflow()
  await page.screenshot({
    path: `${output}/mobile-overview.png`,
    fullPage: true,
  })
  for (const view of ['Inbox explorer', 'Analytics', 'Settings']) {
    await page
      .getByRole('button', {
        name: view === 'Inbox explorer' ? /Inbox explorer/ : view,
        exact: view !== 'Inbox explorer',
      })
      .click()
    await checkOverflow()
    await page.screenshot({
      path: `${output}/mobile-${view.split(' ')[0]!.toLowerCase()}.png`,
      fullPage: true,
    })
  }
  await page.getByRole('button', { name: /Inbox explorer/ }).click()
  await page.locator('.message-row').first().click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await checkOverflow()
  await page.getByRole('button', { name: 'Close message' }).click()
  await page.getByRole('button', { name: 'Refresh demo' }).click()
  await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
})

test('rendered loading and sanitized error can retry', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.route('**/src/repositories/mockEmailRepository.ts', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `export class MockEmailRepository { async list() { await new Promise(resolve=>setTimeout(resolve,800)); throw new Error('private provider payload'); } }`,
    }),
  )
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'Preparing your demo' }),
  ).toBeVisible()
  await page.screenshot({ path: `${output}/loading-state.png` })
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('alert')).not.toContainText(
    'private provider payload',
  )
  await page.screenshot({ path: `${output}/error-state.png` })
  await page.getByRole('button', { name: 'Try again' }).click()
  await expect(
    page.getByRole('heading', { name: 'Preparing your demo' }),
  ).toBeVisible()
  await expect(page.getByRole('alert')).toBeVisible()
})
