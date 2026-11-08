import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { navigation, filters, source } from './fixtures/workspaceControls'
import { textContrastFailures } from './fixtures/contrast'
for (const width of [320, 390, 1024, 1440]) {
  test(`simplified workspace, navigation and keyboard controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.route('https://**/*', (r) => r.abort())
    await page.goto('/app')
    await expect(page.locator('.app-shell')).toHaveAttribute(
      'data-load-status',
      'ready',
    )
    await expect(page.getByText('96 messages', { exact: true })).toBeVisible()
    expect(await page.locator('.mail-row').first().boundingBox()).toMatchObject(
      { width: expect.any(Number) },
    )
    expect(
      (await page.locator('.mail-row').first().boundingBox())?.y,
    ).toBeLessThan(450)
    await expect(
      page.getByRole('region', { name: 'Message reading pane' }),
    ).toHaveCount(0)
    await expect(
      page.getByRole('combobox', { name: 'Category', exact: true }),
    ).toHaveCount(0)
    await mkdir('output/playwright', { recursive: true })
    await page.screenshot({
      path: `output/playwright/simplification-after-${width}.png`,
    })
    if (width < 768) {
      const toggle = page.getByRole('button', {
        name: 'Open navigation',
        exact: true,
      })
      await toggle.focus()
      await page.keyboard.press('Enter')
      const drawer = page.getByRole('dialog', { name: 'Workspace navigation' })
      await expect(drawer).toBeVisible()
      await expect(drawer.getByText('Insights', { exact: true })).toBeVisible()
      expect(await drawer.evaluate((el) => el.matches(':modal'))).toBe(true)
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab')
        expect(
          await page.evaluate(
            () =>
              Boolean(document.activeElement?.closest('.navigation-drawer')) ||
              document.activeElement === document.body,
          ),
        ).toBe(true)
      }
      await page.screenshot({
        path: `output/playwright/simplification-drawer-${width}.png`,
      })
      await page.keyboard.press('Escape')
      await expect(drawer).not.toBeVisible()
      await expect(toggle).toBeFocused()
      await toggle.click()
      await page
        .getByRole('button', { name: 'Close navigation', exact: true })
        .click()
      await expect(toggle).toBeFocused()
    } else {
      const before =
        (await page.locator('.mail-row').first().boundingBox())?.width ?? 0
      await page.getByRole('button', { name: 'Collapse sidebar' }).click()
      await expect(
        page.getByRole('button', { name: 'Expand sidebar' }),
      ).toBeVisible()
      expect(
        (await page.locator('.mail-row').first().boundingBox())?.width,
      ).toBeGreaterThan(before)
      for (const name of ['Inbox explorer', 'Insights', 'Settings'])
        await expect(
          page.getByRole('button', { name, exact: true }),
        ).toHaveAttribute('title', name === 'Inbox explorer' ? 'Inbox' : name)
      await page.screenshot({
        path: `output/playwright/simplification-rail-${width}.png`,
      })
      await page.reload()
      await expect(
        page.getByRole('button', { name: 'Expand sidebar' }),
      ).toBeVisible()
    }
    await navigation(page)
    for (const name of ['Inbox explorer', 'Insights', 'Settings'])
      await expect(page.getByRole('button', { name, exact: true })).toHaveCount(
        1,
      )
    await page.getByRole('button', { name: 'Insights', exact: true }).click()
    await expect(
      page.getByRole('heading', { name: 'Inbox rhythm' }),
    ).toBeVisible()
    await (
      await navigation(page)
    )
      .getByRole('button', { name: 'Settings', exact: true })
      .click()
    await expect(
      page.getByLabel('Display density', { exact: true }),
    ).toBeVisible()
    await page
      .getByLabel('Display density', { exact: true })
      .selectOption('compact')
    await page
      .getByLabel('Reading layout', { exact: true })
      .selectOption('split')
    await (
      await navigation(page)
    )
      .getByRole('button', { name: 'Inbox explorer', exact: true })
      .click()
    await expect(
      page.getByRole('region', { name: 'Message reading pane' }),
    ).toHaveCount(0)
    const trigger = page.locator('.filter-disclosure > summary')
    await trigger.focus()
    await page.keyboard.press('Enter')
    await page
      .getByLabel('Category', { exact: true })
      .selectOption('Jobs and internships')
    await page.getByLabel('Priority', { exact: true }).selectOption('High')
    await expect(page.getByText('12 messages', { exact: true })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
    await expect(
      page.getByRole('combobox', { name: 'Category', exact: true }),
    ).toHaveCount(0)
    await page
      .getByRole('textbox', { name: 'Search messages' })
      .fill('INTERVIEW')
    await expect(page.getByText('6 messages', { exact: true })).toBeVisible()
    await (
      await filters(page)
    )
      .getByRole('button', { name: 'Reset filters' })
      .click()
    const row = page.locator('.mail-row').first()
    await row.focus()
    await page.keyboard.press('Enter')
    await expect(
      page.getByRole('heading', { name: 'Why this category?' }),
    ).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(row).toBeFocused()
    await expect(
      (await source(page)).getByRole('button', { name: 'Connect Gmail' }),
    ).toBeEnabled()
    await page.keyboard.press('Escape')
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true)
    expect(await textContrastFailures(page)).toEqual([])
    expect(
      await page
        .locator('.workspace-sidebar')
        .evaluate((el) => getComputedStyle(el).transitionDuration),
    ).toBe('0s')
  })
}
test('v1 migration preserves all display choices without a write on page load', async ({
  page,
}) => {
  const key = 'inbox-intelligence.workspace'
  const raw = JSON.stringify({
    schemaVersion: 1,
    density: 'compact',
    readingLayout: 'split',
    defaultView: 'Overview',
  })
  await page.addInitScript(({ key, raw }) => localStorage.setItem(key, raw), {
    key,
    raw,
  })
  await page.route('https://**/*', (r) => r.abort())
  await page.goto('/app')
  await expect(
    page.getByRole('heading', { name: 'Insights', exact: true }),
  ).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), key)).toBe(raw)
  await page.getByRole('button', { name: 'Collapse sidebar' }).click()
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? 'null'),
      key,
    ),
  ).toEqual({
    schemaVersion: 2,
    density: 'compact',
    readingLayout: 'split',
    defaultView: 'Overview',
    sidebarState: 'collapsed',
  })
})
