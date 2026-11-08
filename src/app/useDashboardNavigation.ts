import { useEffect, useState } from 'react'
export const viewPaths = {
  Overview: '/app/overview',
  'Inbox explorer': '/app/inbox',
  Analytics: '/app/analytics',
  Settings: '/app/settings',
} as const
export type DashboardView = keyof typeof viewPaths
export function viewFromPath(
  path: string,
  defaultView: DashboardView = 'Inbox explorer',
): DashboardView {
  if (path.replace(/\/$/, '') === '/app') return defaultView
  return (
    (Object.keys(viewPaths) as DashboardView[]).find(
      (view) => viewPaths[view] === path.replace(/\/$/, ''),
    ) ?? 'Overview'
  )
}
export function isDashboardPath(path: string): boolean {
  if (path.replace(/\/$/, '') === '/app') return true
  return Object.values(viewPaths).some(
    (value) => value === path.replace(/\/$/, ''),
  )
}
export function useDashboardNavigation(
  defaultView: DashboardView = 'Inbox explorer',
) {
  const [view, updateView] = useState(() =>
    viewFromPath(window.location.pathname, defaultView),
  )
  useEffect(() => {
    const restore = () =>
      updateView(viewFromPath(window.location.pathname, defaultView))
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [defaultView])
  const setView = (next: DashboardView) => {
    if (window.location.pathname !== viewPaths[next])
      window.history.pushState(null, '', viewPaths[next])
    updateView(next)
  }
  return { view, setView }
}
