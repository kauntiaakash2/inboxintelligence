import { useEffect, useRef, useState } from 'react'
import {
  goalOptions,
  profileOptions,
  type GoalId,
  type PreferenceDraft,
  type ProfileId,
  type UserPreferences,
} from '../../domain/preferences'
import { recommendCategories } from './personalize'
export type SetupStep = 1 | 2 | 3
export function OnboardingWizard({
  initial,
  startStep,
  onSave,
  onDismiss,
}: {
  initial: UserPreferences | null
  startStep: SetupStep
  onSave: (preferences: UserPreferences) => void
  onDismiss: () => void
}) {
  const [step, setStep] = useState<SetupStep>(startStep)
  const [draft, setDraft] = useState<PreferenceDraft>(() => ({
    profile: initial?.profile ?? null,
    goals: [...(initial?.goals ?? [])],
    enabledCategories:
      initial?.status === 'completed'
        ? [...initial.enabledCategories]
        : recommendCategories(initial?.profile ?? null, initial?.goals ?? []),
  }))
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => heading.current?.focus(), [step])
  const suggestions = recommendCategories(draft.profile, draft.goals)
  const updateDeclaration = (profile: ProfileId | null, goals: GoalId[]) => {
    const next = recommendCategories(profile, goals)
    setDraft((previous) => ({
      profile,
      goals,
      enabledCategories:
        next.join('|') === suggestions.join('|')
          ? previous.enabledCategories
          : next,
    }))
  }
  const continueSetup = () => {
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else onSave({ schemaVersion: 1, status: 'completed', ...draft })
  }
  return (
    <section className="panel onboarding-panel" aria-label="Personalized setup">
      <div className="setup-header">
        <div>
          <span className="eyebrow">YOUR VIEW, YOUR CHOICE</span>
          <h2 ref={heading} tabIndex={-1}>
            {step === 1
              ? 'A little about your day'
              : step === 2
                ? 'What would you like to focus on?'
                : 'Review your suggested categories'}
          </h2>
        </div>
        <button className="text-button" type="button" onClick={onDismiss}>
          Skip setup
        </button>
      </div>
      <ol className="setup-progress" aria-label="Setup progress">
        {['Profile', 'Goals', 'Review'].map((label, index) => (
          <li
            key={label}
            aria-current={step === index + 1 ? 'step' : undefined}
          >
            <span>{index + 1}</span>
            {label}
            {index + 1 < step && <span className="sr-only"> completed</span>}
          </li>
        ))}
      </ol>
      <p className="setup-description" id="setup-description">
        Step {step} of 3. Every choice is optional. Your dashboard and Gmail
        controls remain available.
      </p>
      <form
        aria-describedby="setup-description"
        onSubmit={(event) => {
          event.preventDefault()
          continueSetup()
        }}
      >
        {step === 1 && (
          <fieldset>
            <legend>Choose a profile (optional)</legend>
            <p className="setup-help">
              Declared by you, never inferred from your emails. Leave this blank
              if you prefer.
            </p>
            <div className="setup-choices">
              {profileOptions.map((option) => (
                <label className="setup-choice" key={option.id}>
                  <input
                    type="radio"
                    name="profile"
                    value={option.id}
                    checked={draft.profile === option.id}
                    onChange={() => updateDeclaration(option.id, draft.goals)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <button
              className="text-button"
              type="button"
              onClick={() => updateDeclaration(null, draft.goals)}
            >
              Leave profile blank
            </button>
          </fieldset>
        )}
        {step === 2 && (
          <fieldset>
            <legend>Choose your goals (optional)</legend>
            <p className="setup-help">
              Choose any number, including none. Goals take precedence over
              profile defaults.
            </p>
            <div className="setup-choices">
              {goalOptions.map((option) => (
                <label className="setup-choice" key={option.id}>
                  <input
                    type="checkbox"
                    checked={draft.goals.includes(option.id)}
                    onChange={(event) =>
                      updateDeclaration(
                        draft.profile,
                        event.target.checked
                          ? [...draft.goals, option.id]
                          : draft.goals.filter((goal) => goal !== option.id),
                      )
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        {step === 3 && (
          <fieldset>
            <legend>Categories to emphasize (optional)</legend>
            <p className="setup-help">
              {draft.goals.length
                ? 'Suggested from your declared goals.'
                : draft.profile && draft.profile !== 'prefer-not-to-say'
                  ? 'Suggested from your declared profile.'
                  : 'A general starting point; no profile is required.'}{' '}
              Turn any or all off.
            </p>
            <div className="setup-choices">
              {suggestions.map((category) => (
                <label className="setup-choice" key={category}>
                  <input
                    type="checkbox"
                    checked={draft.enabledCategories.includes(category)}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        enabledCategories: event.target.checked
                          ? [...previous.enabledCategories, category]
                          : previous.enabledCategories.filter(
                              (item) => item !== category,
                            ),
                      }))
                    }
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
            <p className="setup-boundary">
              These choices affect display order and focus preferences only. All
              messages remain discoverable and searchable. They never change
              Gmail labels, OAuth scopes, classification rules or message
              retrieval.
            </p>
            <p className="setup-help">
              Saved only in this browser. No email content or account identity
              is stored with preferences. Changing earlier choices may refresh
              these suggestions.
            </p>
          </fieldset>
        )}
        <div className="setup-actions">
          {step > 1 && (
            <button
              className="button"
              type="button"
              onClick={() => setStep(step === 3 ? 2 : 1)}
            >
              Back
            </button>
          )}
          <button className="button setup-primary" type="submit">
            {step === 3 ? 'Confirm and save preferences' : 'Continue'}
          </button>
        </div>
      </form>
    </section>
  )
}
