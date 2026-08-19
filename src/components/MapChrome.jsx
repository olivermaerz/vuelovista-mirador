import { useEffect, useId, useState } from 'react'
import { APP_NAME } from '../appMeta.js'
import { loadChromeCollapsed, saveChromeCollapsed } from '../chromeState.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import AboutButton from './AboutButton.jsx'
import BaseMapPicker from './BaseMapPicker.jsx'
import LayerToggles from './LayerToggles.jsx'
import LicensedChartsPanel from './LicensedChartsPanel.jsx'
import ThemePicker from './ThemePicker.jsx'

/** Phones + smaller tablets (esp. portrait). */
const NARROW_QUERY = '(max-width: 900px)'

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="22"
    height="22"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
)

const CollapseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const ExpandIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 15l6-6 6 6" />
  </svg>
)

const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="20"
    height="20"
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
  >
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

/**
 * @param {{
 *   themes: { id: string, label: string }[],
 *   themeId: string,
 *   onSelectTheme: (id: string) => void,
 *   basemaps: { id: string, label: string }[],
 *   basemapId: string,
 *   onSelectBasemap: (id: string) => void,
 *   plugins: { id: string, label: string }[],
 *   active: Record<string, boolean>,
 *   onToggleLayer: (id: string) => void,
 *   licenseGates: {
 *     id: string,
 *     label: string,
 *     licenseTermsUrl?: string,
 *     requiresLicense: import('../maps/types.js').ChartLicenseGate,
 *   }[],
 *   licensedCharts: Record<string, boolean>,
 *   onSetLicensedChart: (id: string, enabled: boolean, apiKey?: string) => void,
 * }} props
 */
const MapChrome = ({
  themes,
  themeId,
  onSelectTheme,
  basemaps,
  basemapId,
  onSelectBasemap,
  plugins,
  active,
  onToggleLayer,
  licenseGates,
  licensedCharts,
  onSetLicensedChart,
}) => {
  const isNarrow = useMediaQuery(NARROW_QUERY)
  const sheetTitleId = useId()
  const [desktopCollapsed, setDesktopCollapsed] = useState(loadChromeCollapsed)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!isNarrow) setSheetOpen(false)
  }, [isNarrow])

  useEffect(() => {
    if (!sheetOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSheetOpen(false)
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('chrome-sheet-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.classList.remove('chrome-sheet-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [sheetOpen])

  const setCollapsed = (collapsed) => {
    setDesktopCollapsed(collapsed)
    saveChromeCollapsed(collapsed)
  }

  const controls = (
    <>
      <ThemePicker themes={themes} activeId={themeId} onSelect={onSelectTheme} />
      <BaseMapPicker
        basemaps={basemaps}
        activeId={basemapId}
        onSelect={onSelectBasemap}
      />
      <LayerToggles plugins={plugins} active={active} onToggle={onToggleLayer} />
      <LicensedChartsPanel
        gates={licenseGates}
        licensed={licensedCharts}
        onSetLicensed={onSetLicensedChart}
      />
    </>
  )

  if (isNarrow) {
    return (
      <aside className="map-chrome map-chrome--narrow" aria-label="Map controls">
        {!sheetOpen ? (
          <button
            type="button"
            className="chrome-fab"
            aria-expanded={false}
            aria-controls="map-chrome-sheet"
            onClick={() => setSheetOpen(true)}
          >
            <MenuIcon />
            <span>Controls</span>
          </button>
        ) : (
          <div className="chrome-sheet-root">
            <button
              type="button"
              className="chrome-sheet-backdrop"
              aria-label="Close controls"
              onClick={() => setSheetOpen(false)}
            />
            <div
              id="map-chrome-sheet"
              className="chrome-sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby={sheetTitleId}
            >
              <div className="chrome-sheet-handle" aria-hidden="true" />
              <div className="chrome-sheet-header">
                <div className="app-brand chrome-sheet-brand" aria-label={APP_NAME}>
                  <span id={sheetTitleId} className="app-brand-name">
                    {APP_NAME}
                  </span>
                  <AboutButton />
                </div>
                <button
                  type="button"
                  className="chrome-icon-button"
                  aria-label="Close controls"
                  onClick={() => setSheetOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="chrome-sheet-body">{controls}</div>
            </div>
          </div>
        )}
      </aside>
    )
  }

  if (desktopCollapsed) {
    return (
      <aside className="map-chrome map-chrome--collapsed" aria-label="Map controls">
        <button
          type="button"
          className="chrome-chip"
          aria-expanded={false}
          onClick={() => setCollapsed(false)}
        >
          <span className="chrome-chip-name">{APP_NAME}</span>
          <span className="chrome-chip-action" aria-hidden="true">
            <ExpandIcon />
          </span>
          <span className="visually-hidden">Show controls</span>
        </button>
      </aside>
    )
  }

  return (
    <aside className="map-chrome" aria-label="Map controls">
      <div className="app-brand" aria-label={APP_NAME}>
        <span className="app-brand-name">{APP_NAME}</span>
        <AboutButton />
        <button
          type="button"
          className="chrome-icon-button"
          aria-label="Hide controls"
          aria-expanded={true}
          onClick={() => setCollapsed(true)}
        >
          <CollapseIcon />
        </button>
      </div>
      {controls}
    </aside>
  )
}

export default MapChrome
