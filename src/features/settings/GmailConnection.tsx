import {
  GmailAuthorization,
  type AuthorizationState,
} from '../../services/gmailAuthorization'
export function GmailConnection({
  authorization,
  state,
}: {
  authorization: GmailAuthorization
  state: AuthorizationState
}) {
  const waiting =
    state.status === 'preparing' ||
    state.status === 'authorizing' ||
    state.status === 'disconnecting'
  const canDisconnect =
    state.status === 'connected' ||
    state.status === 'preparing' ||
    state.status === 'authorizing' ||
    state.status === 'ready'
  return (
    <section className="connection-panel" aria-label="Gmail authorization">
      <div>
        <strong>Gmail · read-only metadata</strong>
        <p
          role={
            state.status === 'error' || state.status === 'expired'
              ? 'alert'
              : 'status'
          }
        >
          {state.message}
        </p>
      </div>
      <div className="connection-actions">
        {state.status !== 'connected' && (
          <button
            className="button"
            disabled={waiting}
            onClick={() =>
              state.status === 'ready'
                ? authorization.authorize()
                : void authorization.prepare()
            }
          >
            {state.status === 'ready'
              ? 'Authorize Gmail'
              : waiting
                ? state.status === 'disconnecting'
                  ? 'Disconnecting…'
                  : 'Connecting…'
                : 'Connect Gmail'}
          </button>
        )}
        {canDisconnect && (
          <button
            className="button"
            onClick={() => void authorization.disconnect()}
          >
            {state.status === 'connected'
              ? 'Disconnect Gmail / use mock'
              : 'Cancel connection'}
          </button>
        )}
      </div>
    </section>
  )
}
