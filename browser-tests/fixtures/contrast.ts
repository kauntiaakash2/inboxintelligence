import type { Page } from '@playwright/test'
// Checks visible text against solid CSS backgrounds. Gradient endpoints are checked by token tests.
export async function textContrastFailures(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const rgb = (value: string) => (value.match(/[\d.]+/g) ?? []).map(Number)
    const luminance = (color: number[]) =>
      color.slice(0, 3).reduce((sum, value, index) => {
        const channel = value / 255
        return (
          sum +
          (channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4) *
            ([0.2126, 0.7152, 0.0722][index] ?? 0)
        )
      }, 0)
    const failures: string[] = []
    for (const element of document.querySelectorAll<HTMLElement>('body *')) {
      if (
        !Array.from(element.childNodes).some(
          (node) =>
            node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
        )
      )
        continue
      const rect = element.getBoundingClientRect()
      if (
        rect.width < 2 ||
        rect.height < 2 ||
        element.closest('[aria-hidden="true"], [hidden]')
      )
        continue
      const style = getComputedStyle(element)
      if (style.visibility !== 'visible' || style.opacity === '0') continue
      let parent: Element | null = element
      let background: number[] = []
      let gradient = false
      while (parent) {
        const css = getComputedStyle(parent)
        if (css.backgroundImage !== 'none') gradient = true
        const parsed = rgb(css.backgroundColor)
        if (parsed.length === 3 || parsed[3] === 1) {
          background = parsed
          break
        }
        parent = parent.parentElement
      }
      if (gradient || background.length < 3) continue
      const foreground = rgb(style.color)
      const a = luminance(foreground),
        b = luminance(background)
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      const large =
        parseFloat(style.fontSize) >= 24 ||
        (parseFloat(style.fontSize) >= 18.66 &&
          parseInt(style.fontWeight) >= 700)
      if (ratio < (large ? 3 : 4.5))
        failures.push(
          `${element.tagName}.${element.className}: ${ratio.toFixed(2)}`,
        )
    }
    return failures
  })
}
