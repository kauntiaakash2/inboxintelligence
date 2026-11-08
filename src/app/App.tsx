import { useCallback, useEffect, useRef, useState } from 'react'
import {
  useDashboardNavigation,
  type DashboardView,
} from './useDashboardNavigation'
import {
  Check,
  CircleHelp,
  RefreshCw,
  Search,
  PanelLeft,
  ShieldCheck,
} from 'lucide-react'
import {
  type ClassifiedMessage,
  type EmailCategory,
  type EmailRepository,
  type Priority,
} from '../domain/models'
import { MockEmailRepository } from '../repositories/mockEmailRepository'
import { calculateMetrics } from '../services/metrics'
import { GmailAuthorization } from '../services/gmailAuthorization'
import { GmailConnection } from '../features/settings/GmailConnection'
import { GmailDiagnostics } from '../features/settings/GmailDiagnostics'
import { useMailbox } from '../hooks/useMailbox'
import { selectMessages } from '../features/inbox/selectMessages'
import { summarize } from '../features/analytics/summarize'
import { MessageList } from '../features/inbox/MessageList'
import { MessageDetail } from '../features/inbox/MessageDetail'
import { MessageReadingPane } from '../features/inbox/MessageReadingPane'
import { WorkspaceSettings } from '../features/settings/WorkspaceSettings'
import {
  useWorkspacePreferences,
  useWideReadingPane,
} from '../features/settings/workspacePreferences'
import '../styles/workspace.css'
import { StatusPanel } from '../components/common/StatusPanel'
import { PreferenceStore } from '../repositories/preferenceStore'
import { usePreferences } from '../hooks/usePreferences'
import {
  OnboardingWizard,
  type SetupStep,
} from '../features/onboarding/OnboardingWizard'
import { WorkspaceNavigation } from '../components/layout/WorkspaceNavigation'
import { Disclosure } from '../components/common/Disclosure'
import { PreferenceSettings } from '../features/settings/PreferenceSettings'
import {
  orderCategories,
  orderMessagesForDisplay,
  enabledFocus,
} from '../features/onboarding/personalize'
const repository = new MockEmailRepository()
export function App({
  emailRepository = repository,
  authorization: suppliedAuthorization,
  preferenceStore: suppliedPreferenceStore,
}: {
  emailRepository?: EmailRepository
  authorization?: GmailAuthorization
  preferenceStore?: PreferenceStore
}) {
  const workspace = useWorkspacePreferences()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const { view, setView } = useDashboardNavigation(
    workspace.preferences.defaultView,
  )
  const usePane = useWideReadingPane(
    workspace.preferences.readingLayout === 'split',
  )
  const searchInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if (
        event.key !== '/' ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.defaultPrevented ||
        document.querySelector('dialog[open]')
      )
        return
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return
      event.preventDefault()
      searchInput.current?.focus()
    }
    document.addEventListener('keydown', focusSearch)
    return () => document.removeEventListener('keydown', focusSearch)
  }, [])
  const [preferenceStore] = useState(
    () => suppliedPreferenceStore ?? new PreferenceStore(),
  )
  const personalization = usePreferences(preferenceStore)
  const [editor, setEditor] = useState<{
    step: SetupStep
    generation: number
  } | null>(null)
  const [editorGeneration, setEditorGeneration] = useState(0)
  const openSetup = (step: SetupStep = 1) => {
    setEditorGeneration((value) => value + 1)
    setEditor({ step, generation: editorGeneration + 1 })
  }
  const dismissSetup = () => {
    if (!personalization.preferences) personalization.skip()
    setEditor(null)
  }
  const [authorization] = useState(
    () =>
      suppliedAuthorization ??
      new GmailAuthorization({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
      }),
  )
  const mailbox = useMailbox(emailRepository, authorization)
  const { messages, status, isLive, refresh } = mailbox
  const refreshLabel =
    status === 'loading'
      ? isLive
        ? 'Loading Gmail…'
        : 'Loading demo…'
      : isLive
        ? 'Refresh Gmail'
        : 'Refresh demo'
  const sourceLabel = isLive ? 'Live Gmail sample' : 'Mock data'
  const rangeLabel = messages.length
    ? `${messages.at(-1)!.receivedAt.slice(0, 10)} – ${messages[0]!.receivedAt.slice(0, 10)}`
    : 'No messages loaded'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EmailCategory | 'All'>('All')
  const [priority, setPriority] = useState<Priority | 'All'>('All')
  const [selection, setSelection] = useState<{
    id: string
    key: string
    view: DashboardView
  } | null>(null)
  useEffect(
    () => authorization.subscribe(() => setSelection(null)),
    [authorization],
  )
  const selected =
    selection?.key === mailbox.key && selection.view === view
      ? (messages.find((message) => message.id === selection.id) ?? null)
      : null
  const setSelected = (message: ClassifiedMessage) => {
    setSelection({ id: message.id, key: mailbox.key, view })
  }
  const closeSelection = () => {
    const row = document.querySelector<HTMLButtonElement>(
      '.mail-row[aria-current="true"]',
    )
    setSelection(null)
    if (row) row.focus()
    else searchInput.current?.focus()
  }
  const stats = summarize(messages)
  const displayCategories = orderCategories(
    stats.categories,
    personalization.preferences,
  )
  const displayMessages = orderMessagesForDisplay(
    messages,
    personalization.preferences,
  )
  const focusActive = enabledFocus(personalization.preferences).length > 0
  const metrics = calculateMetrics(
    mailbox.events,
    isLive ? 'real' : 'synthetic',
  )
  const visible = selectMessages(displayMessages, query, category, priority)
  const resetFilters = () => {
    setQuery('')
    setCategory('All')
    setPriority('All')
  }
  const openCategory = (value: EmailCategory) => {
    setCategory(value)
    setPriority('All')
    setQuery('')
    setView('Inbox explorer')
  }
  return (
    <div
      className={`app-shell email-workspace ${view === 'Inbox explorer' ? 'is-inbox' : ''} density-${workspace.preferences.density} sidebar-${workspace.preferences.sidebarState}`}
      data-load-status={status}
      data-retained-live-message-count={mailbox.retainedLiveMessageCount}
    >
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <WorkspaceNavigation
        view={view}
        onNavigate={setView}
        collapsed={workspace.preferences.sidebarState === 'collapsed'}
        drawerOpen={drawerOpen}
        onClose={closeDrawer}
      />
      <div className="main-shell">
        <header className="topbar">
          <button
            className="button sidebar-toggle desktop-toggle"
            aria-expanded={workspace.preferences.sidebarState === 'expanded'}
            aria-controls="desktop-navigation"
            aria-label={
              workspace.preferences.sidebarState === 'expanded'
                ? 'Collapse sidebar'
                : 'Expand sidebar'
            }
            title={
              workspace.preferences.sidebarState === 'expanded'
                ? 'Collapse sidebar'
                : 'Expand sidebar'
            }
            onClick={() =>
              workspace.save({
                ...workspace.preferences,
                sidebarState:
                  workspace.preferences.sidebarState === 'expanded'
                    ? 'collapsed'
                    : 'expanded',
              })
            }
          >
            <PanelLeft size={20} />
          </button>
          <button
            className="button sidebar-toggle mobile-toggle"
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            aria-controls="mobile-navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <PanelLeft size={20} />
          </button>
          <form
            className="workspace-search"
            role="search"
            onSubmit={(event) => {
              event.preventDefault()
              setView('Inbox explorer')
            }}
          >
            <label className="search-input">
              <Search size={20} />
              <input
                ref={searchInput}
                aria-label="Search messages"
                aria-describedby="workspace-search-help"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setView('Inbox explorer')
                }}
                placeholder="Search loaded messages"
              />
              <kbd aria-hidden="true">/</kbd>
            </label>
            <span id="workspace-search-help" className="sr-only">
              Sender, subject and mock snippets · local search, no Gmail
              operators
            </span>
          </form>
          <Disclosure
            label={sourceLabel}
            className="source-disclosure"
            attention={
              mailbox.auth.status === 'error' ||
              mailbox.auth.status === 'expired'
            }
          >
            <GmailConnection
              authorization={authorization}
              state={mailbox.auth}
            />
            <p>
              {isLive
                ? 'Read-only metadata sample, excluding Spam and Trash. No bodies or attachments.'
                : 'All messages, insights and processing metrics are synthetic. Gmail is not connected.'}{' '}
              Mail and tokens stay in session memory.
            </p>
            {isLive && mailbox.diagnostics && (
              <GmailDiagnostics
                diagnostics={mailbox.diagnostics}
                durationMs={mailbox.durationMs}
              />
            )}
            {status === 'ready' && (
              <p>
                <strong>
                  {isLive
                    ? 'Gmail sample processing complete'
                    : 'Demo processing complete'}
                </strong>{' '}
                · {metrics.indexed} indexed · {metrics.classified}{' '}
                classifications · {stats.unknown} need a closer look
              </p>
            )}
          </Disclosure>
        </header>
        <main id="main-content" tabIndex={-1}>
          <div className="page-heading">
            <div>
              <h1>
                {view === 'Inbox explorer'
                  ? 'Inbox'
                  : view === 'Settings'
                    ? 'Settings'
                    : 'Insights'}
              </h1>
              <p>
                {sourceLabel} ·{' '}
                {view === 'Inbox explorer'
                  ? `${stats.unread} unread · loaded set`
                  : 'Loaded messages only'}
              </p>
            </div>
            <div className="workspace-actions">
              <button
                className="button refresh"
                aria-label={refreshLabel}
                title={refreshLabel}
                disabled={status === 'loading'}
                onClick={refresh}
              >
                <RefreshCw
                  size={16}
                  className={status === 'loading' ? 'spinning' : ''}
                />
                <span className="refresh-label">{refreshLabel}</span>
              </button>
              {view === 'Inbox explorer' && (
                <Disclosure
                  label={`Filters${category !== 'All' || priority !== 'All' ? ' · active' : ''}`}
                  className="filter-disclosure"
                >
                  <div className="filter-toolbar">
                    <label className="select-label">
                      Category
                      <select
                        aria-label="Category"
                        value={category}
                        onChange={(event) =>
                          setCategory(
                            event.target.value as EmailCategory | 'All',
                          )
                        }
                      >
                        <option value="All">All categories</option>
                        {displayCategories.map(({ name }) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <label className="select-label">
                      Priority
                      <select
                        aria-label="Priority"
                        value={priority}
                        onChange={(event) =>
                          setPriority(event.target.value as Priority | 'All')
                        }
                      >
                        <option value="All">All priorities</option>
                        {['High', 'Medium', 'Low'].map((name) => (
                          <option key={name}>{name}</option>
                        ))}
                      </select>
                    </label>
                    <button className="text-button" onClick={resetFilters}>
                      Reset filters
                    </button>
                  </div>
                </Disclosure>
              )}
            </div>
          </div>
          {editor ? (
            <OnboardingWizard
              key={editor.generation}
              initial={personalization.preferences}
              startStep={editor.step}
              onSave={(preferences) => {
                personalization.save(preferences)
                setEditor(null)
              }}
              onDismiss={dismissSetup}
            />
          ) : !personalization.preferences ? (
            <div
              className="setup-invitation"
              aria-label="Optional personalization"
            >
              <span>Make this view yours.</span>
              <button className="text-button" onClick={() => openSetup()}>
                Set up your view
              </button>
              <button className="text-button" onClick={personalization.skip}>
                Skip setup
              </button>
            </div>
          ) : null}
          {personalization.notice && (
            <p className="preference-notice" role="status">
              {personalization.notice}
            </p>
          )}
          {isLive && (
            <p className="coverage-note" role="status">
              {mailbox.coverage
                ? `${mailbox.coverage.loaded} of ${mailbox.coverage.discovered} selected messages loaded; ${mailbox.coverage.failed} failed. ${mailbox.coverage.hasMore ? 'More messages exist outside this sample.' : 'End of this listing reached.'} Spam and Trash excluded; this is not a full-mailbox sync.`
                : mailbox.progress
                  ? `Loading ${mailbox.progress.phase}: ${mailbox.progress.completed} of ${mailbox.progress.total}. Partial coverage only.`
                  : 'Preparing the newest-message sample.'}
            </p>
          )}
          {status === 'loading' ? (
            <StatusPanel
              title={isLive ? 'Reading Gmail metadata' : 'Preparing your demo'}
              description={
                isLive
                  ? 'Retrieving up to 100 messages with read-only requests. You can disconnect to cancel.'
                  : 'Loading synthetic messages and applying local classification rules.'
              }
            />
          ) : status === 'error' ? (
            <StatusPanel
              error
              title={
                isLive
                  ? 'Gmail metadata could not load'
                  : 'The demo could not load'
              }
              description={mailbox.error}
              action="Try again"
              onAction={refresh}
            />
          ) : (
            <>
              {view === 'Inbox explorer' && (
                <div
                  className={`inbox-reading-layout ${usePane && selected ? 'has-reading-pane' : ''}`}
                >
                  <section className="panel inbox-panel">
                    <div className="results-heading">
                      <strong>{visible.length} messages</strong>
                      <span className="unread-count">
                        {stats.unread} unread
                      </span>
                      <span>
                        {isLive ? 'Gmail sample' : 'Synthetic mailbox'} ·{' '}
                        {focusActive
                          ? 'your focus within rule-priority bands'
                          : 'newest first'}
                      </span>
                    </div>
                    {visible.length ? (
                      <MessageList
                        workspace
                        items={visible}
                        selectedId={selected?.id}
                        onSelect={setSelected}
                      />
                    ) : (
                      <StatusPanel
                        title="No messages found"
                        description={
                          isLive
                            ? 'This sample may be empty or no messages match. Clear filters or refresh the Gmail sample.'
                            : 'Try another search or clear your filters to explore the demo mailbox.'
                        }
                        action="Clear filters"
                        onAction={resetFilters}
                      />
                    )}
                  </section>
                  {usePane && selected && (
                    <MessageReadingPane
                      message={selected}
                      isLive={isLive}
                      onClose={closeSelection}
                    />
                  )}
                </div>
              )}
              {(view === 'Analytics' || view === 'Overview') && (
                <div className="analytics-grid">
                  <div className="insights-summary">
                    <span>{stats.total} indexed</span>
                    <span>{stats.unread} unread</span>
                    <button
                      className="text-button"
                      onClick={() => {
                        setPriority('High')
                        setCategory('All')
                        setQuery('')
                        setView('Inbox explorer')
                      }}
                    >
                      {stats.high} high priority
                    </button>
                    <span>{stats.unknown} unknown</span>
                    <span>
                      {isLive
                        ? 'Metadata sample'
                        : `${Math.round((metrics.avoidance ?? 0) * 100)}% metadata-only · simulated`}
                    </span>
                  </div>
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Category breakdown</h2>
                        <p>Number of messages per category · {sourceLabel}.</p>
                      </div>
                    </div>
                    {displayCategories.map((item, index) => (
                      <button
                        className="analytics-bar"
                        key={item.name}
                        onClick={() => openCategory(item.name)}
                      >
                        <span>{item.name}</span>
                        <span className="bar-track">
                          <span
                            className={`color-bg-${index % 5}`}
                            style={{
                              width: `${(item.count / Math.max(...displayCategories.map((c) => c.count), 1)) * 100}%`,
                            }}
                          />
                        </span>
                        <strong>{item.count}</strong>
                      </button>
                    ))}
                  </section>
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Top senders</h2>
                        <p>
                          {isLive ? 'Sample' : 'Synthetic'} message counts; tied
                          counts sort by name.
                        </p>
                      </div>
                    </div>
                    {stats.senders.slice(0, 8).map((sender, index) => (
                      <div className="sender-row" key={sender.name}>
                        <span className={`avatar avatar-${index % 4}`}>
                          {sender.name[0]}
                        </span>
                        <strong>{sender.name}</strong>
                        <span className="sender-count">
                          {sender.count} messages
                        </span>
                      </div>
                    ))}
                  </section>
                  <section className="panel trend-panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Inbox rhythm</h2>
                        <p>
                          Daily message frequency · {sourceLabel} ·{' '}
                          {isLive ? rangeLabel : '8–31 October'}.
                        </p>
                      </div>
                    </div>
                    <div
                      className="trend-chart"
                      role="img"
                      aria-label={stats.days
                        .map((day) => `${day.date}: ${day.count} messages`)
                        .join('; ')}
                    >
                      {stats.days.map((day) => (
                        <div
                          key={day.date}
                          title={`${day.date}: ${day.count} messages`}
                        >
                          <span style={{ height: `${day.count * 25}%` }} />
                          <small>{day.date.slice(-2)}</small>
                        </div>
                      ))}
                    </div>
                    <p className="chart-caption">
                      {isLive
                        ? 'Counts describe only the loaded sample, not total daily mailbox volume.'
                        : 'This fixture has four messages per day. It demonstrates aggregation, not a real behavioral trend.'}
                    </p>
                  </section>
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Attention & efficiency</h2>
                        <p>
                          {isLive
                            ? 'Rule priorities and actual metadata-only classifications in this sample.'
                            : 'Deterministic priority rules and simulated retrieval.'}
                        </p>
                      </div>
                    </div>
                    {stats.priorities.map((item) => (
                      <div className="metric-row" key={item.name}>
                        <span
                          className={`priority priority-${item.name.toLowerCase()}`}
                        >
                          {item.name} priority
                        </span>
                        <strong>{item.count}</strong>
                      </div>
                    ))}
                    <div className="metric-row">
                      <span>Metadata-only decisions</span>
                      <strong>{metrics.metadataOnly}</strong>
                    </div>
                    <div className="metric-row">
                      <span>
                        {isLive
                          ? 'Full bodies requested'
                          : 'Deeper retrieval requested (simulated)'}
                      </span>
                      <strong>{metrics.bodyRequests}</strong>
                    </div>
                    <p className="quiet-note">
                      {isLive
                        ? 'No classification accuracy, baseline API savings, or cost estimate has been measured.'
                        : 'No Gmail calls, actual fetch savings, accuracy score, or cost estimate have been measured.'}
                    </p>
                  </section>
                </div>
              )}
              {view === 'Settings' && (
                <div className="settings-grid">
                  <WorkspaceSettings
                    preferences={workspace.preferences}
                    notice={workspace.notice}
                    onChange={workspace.save}
                    onReset={workspace.reset}
                  />
                  <PreferenceSettings
                    preferences={personalization.preferences}
                    onEdit={(step) => openSetup(step)}
                    onReset={() => {
                      personalization.reset()
                      setEditor(null)
                    }}
                  />

                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Data source</h2>
                        <p>A clear boundary between demo and personal data.</p>
                      </div>
                      <span className="mock-pill">{sourceLabel}</span>
                    </div>
                    <div className="setting-row">
                      <div>
                        <strong>
                          {isLive
                            ? 'Gmail metadata adapter'
                            : 'Synthetic repository'}
                        </strong>
                        <p>
                          {stats.total}{' '}
                          {isLive
                            ? 'loaded metadata records'
                            : 'generated messages'}
                          . Session memory only.
                        </p>
                      </div>
                      <span className="connected-label">
                        <Check size={15} /> Active
                      </span>
                    </div>
                    <div className="setting-row">
                      <div>
                        <strong>Gmail connection</strong>
                        <p>
                          Read-only authorization starts only with your explicit
                          action. Disconnect clears live data and requests
                          Google revocation.
                        </p>
                      </div>
                      <span className="tag">{mailbox.auth.status}</span>
                    </div>
                    <h3>Planned sync preferences</h3>
                    <p>
                      Sync on open, optional refresh while open, and resumable
                      historical import will arrive in later milestones.
                    </p>
                    <div className="quiet-note">
                      <CircleHelp size={16} /> No synchronization preferences
                      are active in this prototype.
                    </div>
                  </section>
                  <section className="panel privacy-panel">
                    <ShieldCheck size={30} />
                    <h2>Privacy starts with less.</h2>
                    <p>
                      Mock data is the default. If you authorize Gmail, only a
                      bounded metadata sample is read. Messages and tokens stay
                      in application memory. No remote email images or external
                      AI services are used.
                    </p>
                    <ul>
                      <li>Plain-text message rendering</li>
                      <li>No browser token storage</li>
                      <li>In-memory instrumentation without message content</li>
                      <li>No analytics or tracking services</li>
                    </ul>
                    <p>
                      Reloading resets authorization and message state. Declared
                      personalization preferences persist locally until cleared.
                      Disconnect clears live data and requests revocation.
                      Export and durable storage controls remain planned.
                    </p>
                  </section>
                </div>
              )}
            </>
          )}
          {view !== 'Settings' && workspace.notice && (
            <p className="display-notice" role="status">
              {workspace.notice}
            </p>
          )}
        </main>
      </div>
      {selected && !(view === 'Inbox explorer' && usePane) && (
        <MessageDetail
          message={selected}
          isLive={isLive}
          onClose={closeSelection}
        />
      )}
    </div>
  )
}
