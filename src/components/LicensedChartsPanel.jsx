import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { getChartApiKey } from '../maps/licensedCharts.js'

const STORAGE_KEY = 'flightplanning.licensedChartsExpanded'

const loadExpanded = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** @param {boolean} expanded */
const saveExpanded = (expanded) => {
  try {
    localStorage.setItem(STORAGE_KEY, expanded ? '1' : '0')
  } catch {
    // Quota / private mode — ignore
  }
}

/**
 * @param {{
 *   gates: {
 *     id: string,
 *     label: string,
 *     licenseTermsUrl?: string,
 *     requiresLicense: import('../maps/types.js').ChartLicenseGate,
 *   }[],
 *   licensed: Record<string, boolean>,
 *   onSetLicensed: (id: string, enabled: boolean, apiKey?: string) => void,
 * }} props
 */
const LicensedChartsPanel = ({ gates, licensed, onSetLicensed }) => {
  const titleId = useId()
  const bodyId = useId()
  const apiKeyId = useId()
  const [expanded, setExpanded] = useState(loadExpanded)
  const [pendingId, setPendingId] = useState(/** @type {string | null} */ (null))
  const [apiKeyDraft, setApiKeyDraft] = useState('')

  useEffect(() => {
    if (!pendingId) {
      setApiKeyDraft('')
      return
    }
    setApiKeyDraft(getChartApiKey(pendingId))
  }, [pendingId])

  if (!gates.length) return null

  const pending = pendingId ? gates.find((g) => g.id === pendingId) : null
  const needsApiKey = Boolean(pending?.requiresLicense?.requiresApiKey)
  const enabledCount = gates.filter((g) => licensed[g.id]).length

  const setOpen = (next) => {
    setExpanded(next)
    saveExpanded(next)
  }

  const requestEnable = (id) => setPendingId(id)

  const confirmEnable = () => {
    if (!pendingId || !pending) return
    const key = apiKeyDraft.trim()
    if (needsApiKey && !key) return
    onSetLicensed(pendingId, true, needsApiKey ? key : undefined)
    setPendingId(null)
  }

  const cancelEnable = () => setPendingId(null)

  return (
    <>
      <div
        className={`licensed-charts${expanded ? '' : ' licensed-charts--collapsed'}`}
        id="licensed-charts"
      >
        <button
          type="button"
          className="licensed-charts-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setOpen(!expanded)}
        >
          <span className="panel-label">Licensed charts</span>
          <span className="licensed-charts-toggle-meta">
            {enabledCount > 0 ? (
              <span className="licensed-charts-count">{enabledCount} on</span>
            ) : null}
            <span className="licensed-charts-chevron" aria-hidden="true">
              {expanded ? '▾' : '▸'}
            </span>
          </span>
        </button>

        {expanded ? (
          <div id={bodyId} className="licensed-charts-body">
            <p className="licensed-charts-hint">
              These overlays stay off until you confirm you hold provider approval or a
              licence to use them in this app.
            </p>
            {gates.map(({ id, label }) => {
              const on = Boolean(licensed[id])
              return (
                <button
                  key={id}
                  type="button"
                  className={on ? 'active' : undefined}
                  aria-pressed={on}
                  onClick={() => (on ? onSetLicensed(id, false) : requestEnable(id))}
                >
                  {label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>

      {pending ? (
        createPortal(
          <div className="about-modal-root" role="presentation">
            <button
              type="button"
              className="about-modal-backdrop"
              aria-label="Cancel licence confirmation"
              onClick={cancelEnable}
            />
            <div
              className="about-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className="about-modal-close"
                aria-label="Cancel"
                onClick={cancelEnable}
              >
                ×
              </button>
              <h1 id={titleId} className="about-modal-title">
                Enable {pending.label}?
              </h1>
              <p className="about-modal-blurb">{pending.requiresLicense.summary}</p>
              <p className="about-modal-meta">
                Provider: {pending.requiresLicense.provider}
              </p>
              {pending.licenseTermsUrl ? (
                <a
                  className="about-modal-link"
                  href={pending.licenseTermsUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open terms / licence info
                </a>
              ) : null}
              {needsApiKey ? (
                <label className="licensed-charts-key" htmlFor={apiKeyId}>
                  <span className="licensed-charts-key-label">
                    {pending.requiresLicense.apiKeyLabel || 'API key'}
                  </span>
                  <input
                    id={apiKeyId}
                    type="password"
                    autoComplete="off"
                    spellCheck={false}
                    value={apiKeyDraft}
                    onChange={(e) => setApiKeyDraft(e.target.value)}
                    placeholder="Paste your key"
                  />
                  {pending.requiresLicense.apiKeyHelp ? (
                    <span className="licensed-charts-key-help">
                      {pending.requiresLicense.apiKeyHelp}
                    </span>
                  ) : null}
                </label>
              ) : null}
              <div className="licensed-charts-actions">
                <button type="button" className="licensed-charts-cancel" onClick={cancelEnable}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="licensed-charts-confirm"
                  onClick={confirmEnable}
                  disabled={needsApiKey && !apiKeyDraft.trim()}
                >
                  I have approval / a licence
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      ) : null}
    </>
  )
}

export default LicensedChartsPanel
