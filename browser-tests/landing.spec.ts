import { navigation, source } from './fixtures/workspaceControls'
import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { mockGoogle } from './fixtures/google'
import { textContrastFailures } from './fixtures/contrast'

for (const width of [1440, 768, 390, 320]) {
  test(`public navigation, privacy boundary and reduced motion at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const external: string[] = []
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('https://**/*', async (route) => {
      external.push(new URL(route.request().url()).origin)
      await route.abort()
    })
    await page.addInitScript(() =>
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('synthetic failure')
        },
      }),
    )
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Understand your inbox.',
    )
    await expect(
      page.getByText('Synthetic preview', { exact: true }),
    ).toBeVisible()
    await expect(page.locator('.app-shell')).toHaveCount(0)
    await expect(
      (await source(page)).getByRole('button', { name: 'Connect Gmail' }),
    ).toHaveCount(0)
    expect(await page.locator('body').innerText()).not.toMatch(
      /@|browser-test-token|Interview invitation/,
    )
    await page.keyboard.press('Tab')
    await expect(
      page.getByRole('link', { name: 'Skip to content' }),
    ).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('#public-content')).toBeFocused()
    if (width < 700) {
      await page.getByRole('button', { name: 'Open navigation' }).click()
      await expect(
        page.getByRole('button', { name: 'Close navigation' }),
      ).toHaveAttribute('aria-expanded', 'true')
    }
    await page
      .getByRole('navigation', { name: 'Public navigation' })
      .getByRole('link', { name: 'FAQ', exact: true })
      .click()
    const question = page
      .locator('summary')
      .filter({ hasText: 'What permission does Gmail need?' })
    await question.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByText(/Only gmail.readonly, granted through Google/),
    ).toBeVisible()
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    await page.evaluate(() => window.scrollTo(0, 0))
    await mkdir('output/playwright', { recursive: true })
    await page.screenshot({
      path: `output/playwright/clario-hero-${width}.png`,
    })
    await page.screenshot({
      path: `output/playwright/clario-landing-${width}.png`,
      fullPage: true,
    })
    expect(external).toEqual([])
    expect(errors).toEqual([])
    await page.getByRole('link', { name: 'Open app', exact: true }).click()
    await expect(page).toHaveURL('/app')
    await expect(
      page.locator('.app-shell[data-load-status=ready]'),
    ).toBeVisible()
    await expect(
      (await source(page)).getByRole('button', { name: 'Connect Gmail' }),
    ).toBeEnabled()
    await (
      await navigation(page)
    )
      .getByRole('button', { name: 'Insights', exact: true })
      .click()
    await expect(page).toHaveURL('/app/analytics')
    await expect(
      page.getByRole('heading', { name: 'Inbox rhythm' }),
    ).toBeVisible()
    await page.goBack()
    await expect(
      page.getByRole('heading', { name: 'Inbox', exact: true }),
    ).toBeVisible()
    await page.goForward()
    await expect(
      page.getByRole('heading', { name: 'Inbox rhythm' }),
    ).toBeVisible()
  })
}
test('deep links, unknown routes, optional restart and private-to-public separation', async ({
  page,
}) => {
  const { requests } = await mockGoogle(page)
  await page.goto('/app/settings')
  await expect(
    page.getByRole('heading', { name: 'Personalization preferences' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Restart onboarding' }).click()
  await expect(
    page.getByRole('heading', { name: 'A little about your day' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Skip setup', exact: true }).click()
  await (
    await source(page)
  )
    .getByRole('button', { name: 'Connect Gmail' })
    .click()
  await page.getByRole('button', { name: 'Authorize Gmail' }).click()
  await expect(
    page.getByText(/2 of 3 selected messages loaded; 1 failed/),
  ).toBeVisible()
  expect(requests.length).toBeGreaterThan(0)
  await page.getByRole('link', { name: 'About Inbox Intelligence' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.locator('.app-shell')).toHaveCount(0)
  expect(await page.locator('body').innerText()).not.toMatch(
    /sender@example.test|Interview invitation|Course update|browser-test-token/,
  )
  await page.goto('/app/inbox')
  await expect(
    page.getByRole('textbox', { name: 'Search messages' }),
  ).toBeVisible()
  await expect(
    (await source(page)).getByRole('button', { name: 'Connect Gmail' }),
  ).toBeEnabled()
  await page.goto('/not-a-route')
  await expect(
    page.getByRole('heading', { name: 'This page is outside the inbox.' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Back to home' }).click()
  await expect(page).toHaveURL('/')
})

test('rendered text contrast across public and dashboard states', async ({
  page,
}) => {
  await page.route('https://**/*', (route) => route.abort())
  for (const path of [
    '/',
    '/app',
    '/app/inbox',
    '/app/analytics',
    '/app/settings',
  ]) {
    await page.goto(path)
    if (path !== '/')
      await expect(
        page.getByRole('button', { name: 'Refresh demo', exact: true }),
      ).toBeEnabled()
    expect(await textContrastFailures(page), path).toEqual([])
  }
  await page.getByRole('button', { name: 'Restart onboarding' }).click()
  expect(await textContrastFailures(page)).toEqual([])
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  expect(await textContrastFailures(page)).toEqual([])
})
