import { profileOptions, type UserPreferences } from '../../domain/preferences'
import { enabledFocus } from './personalize'
export function PersonalizationPanel({
  preferences,
  notice,
  onStart,
  onSkip,
  compact = false,
}: {
  preferences: UserPreferences | null
  notice: string
  onStart: () => void
  onSkip: () => void
  compact?: boolean
}) {
  const focus = enabledFocus(preferences)
  return (
    <section
      className={`panel personalization-summary ${compact ? 'is-compact' : ''}`}
      aria-label="Dashboard personalization"
    >
      <div className="setup-header">
        <div>
          <h2>
            {preferences?.status === 'completed'
              ? 'Your focus'
              : compact
                ? 'Personalize'
                : 'Make this view yours'}
          </h2>
          <p className="setup-help">
            {preferences?.status === 'completed'
              ? compact && focus.length
                ? 'Your declared focus. Rule priority stays first.'
                : `Based on your choices${preferences.profile ? ` · ${profileOptions.find((profile) => profile.id === preferences.profile)?.label}` : ''}. ${focus.length ? 'Rule-based high priority stays first; your categories reorder within each priority band.' : 'All focus categories are off; the default view stays active.'}`
              : preferences?.status === 'skipped'
                ? compact
                  ? 'Setup skipped. Edit any time.'
                  : 'Setup skipped. The default dashboard is active; you can personalize it at any time.'
                : compact
                  ? 'Optional. All messages stay available.'
                  : 'Optional setup helps emphasize what matters to you. It never limits which messages are retrieved.'}
          </p>
        </div>
        <div className="setup-actions">
          <button type="button" className="button" onClick={onStart}>
            {preferences ? 'Edit setup' : 'Set up your view'}
          </button>
          {!preferences && (
            <button type="button" className="text-button" onClick={onSkip}>
              Skip setup
            </button>
          )}
        </div>
      </div>
      {focus.length > 0 && (
        <ul className="focus-tags" aria-label="Enabled focus categories">
          {focus.map((category) => (
            <li className="tag" key={category}>
              {category}
            </li>
          ))}
        </ul>
      )}
      {notice && (
        <p className="preference-notice" role="status">
          {notice}
        </p>
      )}
    </section>
  )
}
