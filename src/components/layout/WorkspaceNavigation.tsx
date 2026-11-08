import { useEffect, useRef } from 'react'
import { Inbox, BarChart3, Settings, Mail, ArrowUpRight, X } from 'lucide-react'
import type { DashboardView } from '../../app/useDashboardNavigation'
const destinations = [
  { view: 'Inbox explorer', label: 'Inbox', icon: Inbox },
  { view: 'Analytics', label: 'Insights', icon: BarChart3 },
  { view: 'Settings', label: 'Settings', icon: Settings },
] as const
export function WorkspaceNavigation({
  view,
  onNavigate,
  collapsed,
  drawerOpen,
  onClose,
}: {
  view: DashboardView
  onNavigate: (view: DashboardView) => void
  collapsed: boolean
  drawerOpen: boolean
  onClose: () => void
}) {
  const drawer = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    if (!drawerOpen) return
    const dialog = drawer.current
    const previous = document.activeElement
    dialog?.showModal()
    const query = window.matchMedia?.('(min-width: 768px)')
    const onResize = () => {
      if (query?.matches) onClose()
    }
    query?.addEventListener('change', onResize)
    return () => {
      dialog?.close()
      query?.removeEventListener('change', onResize)
      if (
        previous instanceof HTMLElement &&
        previous.isConnected &&
        previous.getClientRects().length
      )
        previous.focus()
      else document.querySelector<HTMLButtonElement>('.desktop-toggle')?.focus()
    }
  }, [drawerOpen, onClose])
  const content = (mobile: boolean) => (
    <>
      <div className="workspace-brand">
        <Mail size={22} />
        <span>
          inbox<strong>intelligence</strong>
        </span>
      </div>
      {mobile && (
        <button
          className="button drawer-close"
          aria-label="Close navigation"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      )}
      <nav aria-label="Main navigation">
        {destinations.map(({ view: destination, label, icon: Icon }) => {
          const active =
            view === destination ||
            (view === 'Overview' && destination === 'Analytics')
          return (
            <button
              key={destination}
              className={`nav-item ${active ? 'active' : ''}`}
              aria-label={label === 'Inbox' ? 'Inbox explorer' : label}
              title={label}
              aria-current={active ? 'page' : undefined}
              onClick={() => {
                onNavigate(destination)
                if (mobile) onClose()
              }}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>
      <a
        className="site-return"
        href="/"
        title="About Inbox Intelligence"
        aria-label="About Inbox Intelligence"
      >
        <ArrowUpRight size={18} />
        <span>About Inbox Intelligence</span>
      </a>
    </>
  )
  return (
    <>
      <aside
        id="desktop-navigation"
        className={`sidebar workspace-sidebar ${collapsed ? 'is-collapsed' : ''}`}
      >
        {content(false)}
      </aside>
      <dialog
        ref={drawer}
        id="mobile-navigation"
        className="navigation-drawer"
        aria-label="Workspace navigation"
        onCancel={(event) => {
          event.preventDefault()
          onClose()
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        <div>{content(true)}</div>
      </dialog>
    </>
  )
}
