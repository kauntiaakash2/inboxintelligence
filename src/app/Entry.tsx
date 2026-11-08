import { lazy, Suspense } from 'react'
import { LandingPage } from '../features/landing/LandingPage'
import { isDashboardPath } from './useDashboardNavigation'
const Dashboard = lazy(() =>
  import('./App').then((module) => ({ default: module.App })),
)
export function Entry() {
  if (window.location.pathname === '/') return <LandingPage />
  if (isDashboardPath(window.location.pathname))
    return (
      <Suspense
        fallback={
          <main className="route-feedback" role="status">
            <h1>Opening your workspace</h1>
            <p>
              Your dashboard is loading. Gmail authorization remains optional.
            </p>
            <a className="button" href="/">
              Back to home
            </a>
          </main>
        }
      >
        <Dashboard />
      </Suspense>
    )
  return (
    <main className="route-feedback">
      <span className="eyebrow">404</span>
      <h1>This page is outside the inbox.</h1>
      <p>Choose the public overview or return to your workspace.</p>
      <a className="button setup-primary" href="/">
        Back to home
      </a>
      <a className="button" href="/app">
        Open app
      </a>
    </main>
  )
}
