import type { WorkspacePreferences } from './workspacePreferences'
export function WorkspaceSettings({
  preferences,
  notice,
  onChange,
  onReset,
}: {
  preferences: WorkspacePreferences
  notice: string
  onChange: (value: WorkspacePreferences) => void
  onReset: () => void
}) {
  return (
    <section
      className="panel workspace-settings"
      aria-label="Workspace display settings"
    >
      <div className="panel-heading">
        <div>
          <h2>Workspace display</h2>
          <p>Local display choices. No mailbox data is saved.</p>
        </div>
      </div>
      <div className="workspace-setting-controls">
        <label>
          Default workspace
          <select
            aria-label="Default workspace"
            value={
              preferences.defaultView === 'Overview'
                ? 'Analytics'
                : preferences.defaultView
            }
            onChange={(event) => {
              const defaultView = event.target.value
              if (
                defaultView === 'Inbox explorer' ||
                defaultView === 'Overview' ||
                defaultView === 'Analytics'
              )
                onChange({ ...preferences, defaultView })
            }}
          >
            <option value="Inbox explorer">Inbox</option>
            <option value="Analytics">Insights</option>
          </select>
        </label>
        <label>
          Display density
          <select
            aria-label="Display density"
            value={preferences.density}
            onChange={(event) => {
              const density = event.target.value
              if (density === 'comfortable' || density === 'compact')
                onChange({ ...preferences, density })
            }}
          >
            <option value="comfortable">Comfortable</option>
            <option value="compact">Compact</option>
          </select>
        </label>
        <label>
          Reading layout
          <select
            aria-label="Reading layout"
            value={preferences.readingLayout}
            onChange={(event) => {
              const readingLayout = event.target.value
              if (readingLayout === 'dialog' || readingLayout === 'split')
                onChange({ ...preferences, readingLayout })
            }}
          >
            <option value="dialog">Message dialog</option>
            <option value="split">Side-by-side on wide screens</option>
          </select>
        </label>
      </div>
      <p className="setup-help">
        The default applies on your next visit to /app; explicit view links
        always win. The side pane uses already-loaded content and falls back to
        the dialog below 1100px. Opening a message never changes its Gmail read
        status.
      </p>
      <button className="button" onClick={onReset}>
        Reset display preferences
      </button>
      {notice && (
        <p className="preference-notice" role="status">
          {notice}
        </p>
      )}
    </section>
  )
}
