import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  CircleHelp,
  Inbox,
  LayoutDashboard,
  Mail,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import {
  categories,
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
import { StatusPanel } from '../components/common/StatusPanel'
const repository = new MockEmailRepository()
type View = 'Overview' | 'Inbox explorer' | 'Analytics' | 'Settings'
const navigation = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Inbox explorer', icon: Inbox },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
] as const
export function App({
  emailRepository = repository,
  authorization: suppliedAuthorization,
}: {
  emailRepository?: EmailRepository
  authorization?: GmailAuthorization
}) {
  const [view, setView] = useState<View>('Overview')
  const [authorization] = useState(
    () =>
      suppliedAuthorization ??
      new GmailAuthorization({
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
      }),
  )
  const mailbox = useMailbox(emailRepository, authorization)
  const { messages, status, isLive, refresh } = mailbox
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
  } | null>(null)
  useEffect(
    () => authorization.subscribe(() => setSelection(null)),
    [authorization],
  )
  const selected =
    selection?.key === mailbox.key
      ? (messages.find((message) => message.id === selection.id) ?? null)
      : null
  const setSelected = (message: ClassifiedMessage) =>
    setSelection({ id: message.id, key: mailbox.key })
  const stats = summarize(messages)
  const metrics = calculateMetrics(
    mailbox.events,
    isLive ? 'real' : 'synthetic',
  )
  const chartColors = ['#46785c', '#9eae89', '#c1a66d', '#7d9991', '#a9b39b']
  const categoryGradient = stats.categories
    .map((item, index) => {
      const start = stats.total
        ? (stats.categories
            .slice(0, index)
            .reduce((sum, entry) => sum + entry.count, 0) /
            stats.total) *
          100
        : 0
      const end = start + (stats.total ? (item.count / stats.total) * 100 : 0)
      return `${chartColors[index % chartColors.length]} ${start}% ${end}%`
    })
    .join(', ')
  const visible = selectMessages(messages, query, category, priority)
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
      className="app-shell"
      data-retained-live-message-count={mailbox.retainedLiveMessageCount}
    >
      <aside className="sidebar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault()
            setView('Overview')
          }}
        >
          <span className="brand-mark">
            <Mail size={22} />
          </span>
          <span>
            inbox<span className="brand-light">intelligence</span>
            <small>A LITTLE MORE CLARITY.</small>
          </span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">{isLive ? 'G' : 'D'}</span>
          <div>
            <strong>{isLive ? 'Gmail workspace' : 'Demo workspace'}</strong>
            <span>
              {isLive ? 'Partial metadata sample' : 'Synthetic email data'}
            </span>
          </div>
          <span className="workspace-dot" />
        </div>
        <p className="nav-label">WORKSPACE</p>
        <nav aria-label="Main navigation">
          {navigation.map(({ name, icon: Icon }) => (
            <button
              key={name}
              aria-label={name}
              onClick={() => setView(name)}
              className={`nav-item ${view === name ? 'active' : ''}`}
              aria-current={view === name ? 'page' : undefined}
            >
              <Icon size={19} />
              <span>{name}</span>
              {name === 'Inbox explorer' && (
                <span className="nav-count">{stats.total}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <ShieldCheck size={22} />
          <strong>Your inbox. Your space.</strong>
          <p>
            {isLive
              ? 'Live metadata stays in this page session. No bodies, attachments, or external AI.'
              : 'This demo stays in your browser. No Gmail connection. No external AI.'}
          </p>
          <button onClick={() => setView('Settings')}>
            Explore our approach <ArrowRight size={14} />
          </button>
        </div>
        <div className="sidebar-footer">
          <span className="avatar avatar-0">DI</span>
          <div>
            <strong>{isLive ? 'Gmail explorer' : 'Demo explorer'}</strong>
            <small>Personal workspace</small>
          </div>
          <span className="demo-dot" />
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} />
            <strong>{view}</strong>
          </div>
          <div className="topbar-right">
            <span className="mock-pill">
              <span />
              {sourceLabel}
            </span>
            <span className="local-indicator">
              <ShieldCheck size={15} /> Browser only
            </span>
          </div>
        </header>
        <main id="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">UNDERSTAND YOUR INBOX</div>
              <h1>
                {view === 'Overview'
                  ? 'Less noise. More perspective.'
                  : view === 'Inbox explorer'
                    ? 'A clearer view of every message.'
                    : view === 'Analytics'
                      ? 'Find the patterns that matter.'
                      : 'A workspace you can trust.'}
              </h1>
              <p>
                {view === 'Overview'
                  ? 'Your email, thoughtfully organized. Here’s the bigger picture.'
                  : view === 'Inbox explorer'
                    ? 'Search, explore, and understand why a message belongs.'
                    : view === 'Analytics'
                      ? isLive
                        ? 'Explore this Gmail metadata sample. These charts do not cover your full mailbox.'
                        : 'Explore trends across the synthetic mailbox. Every chart uses mock data.'
                      : 'Transparent by design. You’re always in control of what comes next.'}
              </p>
            </div>
            <button
              className="button refresh"
              disabled={status === 'loading'}
              onClick={refresh}
            >
              <RefreshCw
                size={16}
                className={status === 'loading' ? 'spinning' : ''}
              />
              {status === 'loading'
                ? isLive
                  ? 'Loading Gmail…'
                  : 'Loading demo…'
                : isLive
                  ? 'Refresh Gmail'
                  : 'Refresh demo'}
            </button>
          </div>
          <GmailConnection authorization={authorization} state={mailbox.auth} />
          <div className="demo-banner">
            <Sparkles size={17} />
            <p>
              {isLive ? (
                <>
                  <strong>Live Gmail · partial coverage.</strong> Up to the
                  newest 100 messages, excluding Spam and Trash. Metadata only;
                  no bodies or attachments. All charts describe this sample.
                </>
              ) : (
                <>
                  <strong>A preview of a calmer inbox.</strong> All messages,
                  insights, and processing metrics are synthetic. Gmail is not
                  connected.
                </>
              )}
            </p>
            <span>{isLive ? 'READ ONLY' : 'DEMO MODE'}</span>
          </div>
          {isLive && (
            <p className="coverage-note" role="status">
              {mailbox.coverage
                ? `${mailbox.coverage.loaded} of ${mailbox.coverage.discovered} selected messages loaded; ${mailbox.coverage.failed} failed. ${mailbox.coverage.hasMore ? 'More messages exist outside this sample.' : 'End of this listing reached.'} Spam and Trash excluded; this is not a full-mailbox sync.`
                : mailbox.progress
                  ? `Loading ${mailbox.progress.phase}: ${mailbox.progress.completed} of ${mailbox.progress.total}. Partial coverage only.`
                  : 'Preparing the newest-message sample.'}
            </p>
          )}
          {isLive && mailbox.diagnostics && (
            <GmailDiagnostics
              diagnostics={mailbox.diagnostics}
              durationMs={mailbox.durationMs}
            />
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
              {view === 'Overview' && (
                <>
                  <div className="section-kicker">
                    <span>YOUR INBOX AT A GLANCE</span>
                    <span>
                      {isLive
                        ? `Gmail sample · ${rangeLabel}`
                        : 'Mock mailbox · 8–31 Oct 2026'}
                    </span>
                  </div>
                  <div className="stat-grid">
                    {[
                      {
                        label: 'Indexed messages',
                        value: stats.total,
                        detail: 'Across 11 categories',
                        icon: Mail,
                      },
                      {
                        label: 'Unread messages',
                        value: stats.unread,
                        detail: 'Ready when you are',
                        icon: Inbox,
                      },
                      {
                        label: 'High priority',
                        value: stats.high,
                        detail: 'Worth a closer look',
                        icon: Activity,
                      },
                      {
                        label: isLive
                          ? 'Metadata loaded'
                          : 'Metadata-only decisions',
                        value: isLive
                          ? metrics.metadataOnly
                          : `${Math.round((metrics.avoidance ?? 0) * 100)}%`,
                        detail: isLive
                          ? 'No bodies requested'
                          : 'Simulated retrieval policy',
                        icon: ShieldCheck,
                      },
                    ].map(({ label, value, detail, icon: Icon }) => (
                      <article className="stat-card" key={label}>
                        <div className="stat-top">
                          <span>{label}</span>
                          <Icon size={18} />
                        </div>
                        <strong>{value}</strong>
                        <p>{detail}</p>
                      </article>
                    ))}
                  </div>
                  <div className="overview-grid">
                    <section className="panel category-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>A place for everything</h2>
                          <p>Category distribution · {sourceLabel}</p>
                        </div>
                        <span className="soft-icon">
                          <BarChart3 size={18} />
                        </span>
                      </div>
                      <div className="category-chart">
                        <div
                          className="donut"
                          style={{
                            background: `conic-gradient(${categoryGradient})`,
                          }}
                          role="img"
                          aria-label={`${sourceLabel} category distribution: ${stats.total} messages across ${categories.length} categories`}
                        >
                          <div>
                            <strong>{stats.total}</strong>
                            <span>messages</span>
                          </div>
                        </div>
                        <div className="chart-summary">
                          <span className="mini-label">A THOUGHTFUL SORT</span>
                          <strong>
                            {categories.length} categories,
                            <br />
                            one clear picture.
                          </strong>
                          <p>
                            Rules bring order.
                            <br />
                            You bring the context.
                          </p>
                        </div>
                      </div>
                      <div className="category-bars">
                        {stats.categories.map((item, index) => (
                          <button
                            key={item.name}
                            onClick={() => openCategory(item.name)}
                          >
                            <span
                              className={`category-dot color-${index % 5}`}
                            />
                            <span>{item.name}</span>
                            <span className="bar-track">
                              <span
                                className={`color-bg-${index % 5}`}
                                style={{
                                  width: `${(item.count / Math.max(stats.total, 1)) * 100 * 4}%`,
                                }}
                              />
                            </span>
                            <strong>{item.count}</strong>
                          </button>
                        ))}
                      </div>
                    </section>
                    <section className="panel priority-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>A little attention, please</h2>
                          <p>Recent high-priority messages · {sourceLabel}</p>
                        </div>
                        <span className="attention-dot" />
                      </div>
                      {
                        <MessageList
                          items={messages
                            .filter(
                              (message) =>
                                message.classification.priority === 'High',
                            )
                            .slice(0, 4)}
                          compact
                          onSelect={setSelected}
                        />
                      }
                      <button
                        className="panel-link"
                        onClick={() => {
                          resetFilters()
                          setPriority('High')
                          setView('Inbox explorer')
                        }}
                      >
                        Explore priority messages <ArrowRight size={15} />
                      </button>
                      <div className="explanation-note">
                        <Sparkles size={17} />
                        <p>
                          <strong>No black boxes here.</strong>
                          <br />
                          Open a message to see the rule behind its category.
                        </p>
                      </div>
                    </section>
                  </div>
                  <div className="lower-grid">
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Familiar faces</h2>
                          <p>Recurring sender patterns · {sourceLabel}</p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => setView('Analytics')}
                        >
                          All insights <ArrowRight size={14} />
                        </button>
                      </div>
                      {stats.senders.slice(0, 4).map((sender, index) => (
                        <div className="sender-row" key={sender.name}>
                          <span className={`avatar avatar-${index}`}>
                            {sender.name.slice(0, 1)}
                          </span>
                          <div>
                            <strong>{sender.name}</strong>
                            <span>
                              {isLive
                                ? 'Sender in this sample'
                                : 'Recurring synthetic sender'}
                            </span>
                          </div>
                          <strong>
                            {sender.count}
                            <small> messages</small>
                          </strong>
                        </div>
                      ))}
                    </section>
                    <section className="panel processing-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Less fetching. More intention.</h2>
                          <p>
                            {isLive
                              ? 'Current metadata retrieval'
                              : 'Processing policy simulation'}
                          </p>
                        </div>
                        <ShieldCheck size={19} />
                      </div>
                      <div className="processing-number">
                        {metrics.metadataOnly}
                        <span>of {stats.total} messages</span>
                      </div>
                      <p>
                        {isLive
                          ? 'All loaded messages were classified from metadata. Unfamiliar messages remain visible; this phase never fetches bodies.'
                          : 'Classified from metadata under the demo policy. Unfamiliar messages are marked for deeper review.'}
                      </p>
                      <div className="efficiency-track">
                        <span
                          style={{
                            width: `${(metrics.avoidance ?? 0) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="processing-legend">
                        <span>
                          <i /> Metadata only
                        </span>
                        <span>
                          {metrics.bodyRequests}{' '}
                          {isLive ? 'body requests' : 'body-request events'}
                        </span>
                      </div>
                      <div className="quiet-note">
                        <CircleHelp size={15} />{' '}
                        {isLive
                          ? 'Metadata-only counts do not establish API savings or accuracy.'
                          : 'Simulated decisions, not measured Gmail API savings.'}
                      </div>
                    </section>
                  </div>
                  <section className="activity-strip">
                    <span className="activity-check">
                      <Check size={17} />
                    </span>
                    <div>
                      <strong>
                        {isLive
                          ? 'Gmail sample processing complete'
                          : 'Demo processing complete'}
                      </strong>
                      <p>
                        {metrics.indexed}{' '}
                        {isLive
                          ? 'Gmail metadata records loaded'
                          : 'synthetic messages indexed'}{' '}
                        · {metrics.classified} classifications · {stats.unknown}{' '}
                        need a closer look
                      </p>
                    </div>
                    <span className="tag">Local session</span>
                  </section>
                </>
              )}
              {view === 'Inbox explorer' && (
                <section className="panel inbox-panel">
                  <div className="filter-toolbar">
                    <label className="search-input">
                      <Search size={18} />
                      <input
                        aria-label="Search messages"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search sender, subject, or snippet…"
                      />
                    </label>
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
                        {categories.map((name) => (
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
                  <div className="results-heading">
                    <strong>{visible.length} messages</strong>
                    <span>
                      {isLive ? 'Gmail sample' : 'Synthetic mailbox'} · newest
                      first
                    </span>
                  </div>
                  {visible.length ? (
                    <MessageList items={visible} onSelect={setSelected} />
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
              )}
              {view === 'Analytics' && (
                <div className="analytics-grid">
                  <section className="panel">
                    <div className="panel-heading">
                      <div>
                        <h2>Category breakdown</h2>
                        <p>Number of messages per category · {sourceLabel}.</p>
                      </div>
                    </div>
                    {stats.categories.map((item, index) => (
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
                              width: `${(item.count / Math.max(...stats.categories.map((c) => c.count), 1)) * 100}%`,
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
                      Reloading resets authorization and message state.
                      Disconnect clears live data and requests revocation.
                      Export and durable storage controls remain planned.
                    </p>
                  </section>
                </div>
              )}
            </>
          )}
          <footer className="page-footer">
            <span>
              <span className="footer-mark" /> Built for clarity. Designed for
              privacy.
            </span>
            <span>Inbox Intelligence · Phase 2 preview</span>
          </footer>
        </main>
      </div>
      {selected && (
        <MessageDetail
          message={selected}
          isLive={isLive}
          onClose={() => setSelection(null)}
        />
      )}
    </div>
  )
}
