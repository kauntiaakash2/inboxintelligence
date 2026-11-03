import {
  goalOptions,
  profileOptions,
  type UserPreferences,
} from '../../domain/preferences'
import type { SetupStep } from '../onboarding/OnboardingWizard'
export function PreferenceSettings({
  preferences,
  onEdit,
  onReset,
}: {
  preferences: UserPreferences | null
  onEdit: (step: SetupStep) => void
  onReset: () => void
}) {
  return (
    <section
      className="panel preference-settings"
      aria-label="Personalization settings"
    >
      <div className="panel-heading">
        <div>
          <h2>Personalization preferences</h2>
          <p>User-declared choices · saved on this browser only</p>
        </div>
      </div>
      <dl className="preference-details">
        <dt>Profile</dt>
        <dd>
          {profileOptions.find((option) => option.id === preferences?.profile)
            ?.label ?? 'Not specified'}
        </dd>
        <dt>Goals</dt>
        <dd>
          {preferences?.goals.length
            ? goalOptions
                .filter((option) => preferences.goals.includes(option.id))
                .map((option) => option.label)
                .join(', ')
            : 'None selected'}
        </dd>
        <dt>Focus categories</dt>
        <dd>
          {preferences?.enabledCategories.length
            ? preferences.enabledCategories.join(', ')
            : 'Default view; no categories emphasized'}
        </dd>
      </dl>
      <div className="preference-controls">
        <button className="button" onClick={() => onEdit(1)}>
          Change profile
        </button>
        <button className="button" onClick={() => onEdit(2)}>
          Change goals
        </button>
        <button className="button" onClick={() => onEdit(3)}>
          Manage suggested categories
        </button>
        <button className="button" onClick={() => onEdit(1)}>
          Restart onboarding
        </button>
        <button className="button" onClick={onReset}>
          Clear preferences
        </button>
      </div>
      <p className="setup-help">
        Clear preferences restores the default view and removes only this app’s
        preference record. It does not disconnect Gmail or remove mailbox data.
        Restarting opens your saved choices for review; nothing changes until
        you confirm.
      </p>
    </section>
  )
}
