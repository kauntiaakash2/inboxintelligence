import type { Page } from '@playwright/test'
export async function navigation(page: Page) {
  await page.locator('.app-shell').waitFor({ state: 'visible' })
  const toggle = page.getByRole('button', {
    name: 'Open navigation',
    exact: true,
  })
  if (
    (await toggle.isVisible()) &&
    (await toggle.getAttribute('aria-expanded')) !== 'true'
  )
    await toggle.click()
  return page
}
export async function source(page: Page) {
  if (new URL(page.url()).pathname.startsWith('/app'))
    await page.locator('.app-shell').waitFor({ state: 'visible' })
  const disclosure = page.locator('.source-disclosure')
  if ((await disclosure.count()) === 0) return page
  if (
    !(await disclosure.evaluate(
      (node) => node instanceof HTMLDetailsElement && node.open,
    ))
  )
    await disclosure.locator('summary').click()
  return page
}
export async function filters(page: Page) {
  const disclosure = page.locator('.filter-disclosure')
  if (
    !(await disclosure.evaluate(
      (node) => node instanceof HTMLDetailsElement && node.open,
    ))
  )
    await disclosure.locator('summary').click()
  return page
}
export async function display(page: Page) {
  await (
    await navigation(page)
  )
    .getByRole('button', { name: 'Settings', exact: true })
    .click()
}
