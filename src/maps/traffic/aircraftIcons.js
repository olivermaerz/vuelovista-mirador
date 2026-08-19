/**
 * Nose-up aircraft silhouettes (viewBox 0 0 24 24).
 * Shapes are intentionally different (not scaled variants of one jet).
 *
 * @typedef {'light' | 'jet' | 'heavy' | 'superheavy' | 'heli' | 'glider' | 'ultralight' | 'uav'} AircraftIconKind
 */

/** @type {Record<AircraftIconKind, string>} */
export const AIRCRAFT_ICON_SVG = {
  // GA monoplane: spinner + straight wings + cruciform tail (SR22 / C172 class)
  light:
    '<circle cx="12" cy="3.2" r="1.55"/>' +
    '<path d="M11.15 4.5h1.7v12.2h-1.7z"/>' +
    '<path d="M3.2 9.1h17.6v1.7H3.2z"/>' +
    '<path d="M11.15 16.5h1.7l2.6 4.1h-1.55l-1.9-2.85L9.95 20.6H8.4z"/>' +
    '<path d="M8.6 17.4h6.8v1.15H8.6z"/>',

  // Swept narrowbody jet
  jet:
    '<path d="M12 1.6l1.2 7.4 8.2 3.1v1.45l-8.2-2.35V17.4l2.5 1.85V20.7l-3.7-1-3.7 1v-1.45L10.8 17.4v-6.2L2.6 13.55V12.1l8.2-3.1L12 1.6z"/>',

  // Widebody: broader swept wing + under-wing engine pods
  heavy:
    '<path d="M12 1.4l1.4 6.8 9.2 3.5v1.6l-9.2-2.5V16.9l2.85 2.15V21l-4.25-1.15L7.75 21v-1.95L10.6 16.9v-6.1L1.4 13.3v-1.6l9.2-3.5L12 1.4z"/>' +
    '<path d="M5.4 12.05h2.1v1.35H5.4zm11.1 0h2.1v1.35h-2.1z"/>',

  // Super-heavy: double-deck hump + four engines + max span
  superheavy:
    '<path d="M10.2 5.4h3.6v3.2h-3.6z"/>' +
    '<path d="M12 1.2l1.55 6.2 9.85 3.85v1.7l-9.85-2.7V16.2l1.2.4 2.35 2V20.7l-4.1-1.1-4.1 1.1v-2.1l2.35-2 1.2-.4V10.25L.6 12.95v-1.7l9.85-3.85L12 1.2z"/>' +
    '<path d="M4.2 12.2h1.85v1.25H4.2zm5.1 0h1.85v1.25H9.3zm7.85 0H19v1.25h-1.85zm-5.1 0h1.85v1.25h-1.85z"/>',

  // Helicopter from above: rotor disc, cabin, boom, tail rotor (nose-up)
  heli:
    '<circle cx="12" cy="10" r="7.2" fill="none" stroke-width="1.15"/>' +
    '<path d="M12 3.1v13.8M5.1 10h13.8"/>' +
    '<path d="M10.5 7.2h3v7.6h-3z"/>' +
    '<path d="M11.25 14.6h1.5v6.1h-1.5z"/>' +
    '<path d="M9.6 20.2h4.8v1.15H9.6z"/>',

  // Sailplane: extreme span, slim fuse, T-tail
  glider:
    '<path d="M11.4 2.4h1.2v14.2h-1.2z"/>' +
    '<path d="M1.2 8.6h21.6v1.05H1.2z"/>' +
    '<path d="M8.4 16.3h7.2v1.05H8.4z"/>' +
    '<path d="M11.4 17.1h1.2v4.2h-1.2z"/>',

  // Ultralight: high wing + strut + pod fuselage
  ultralight:
    '<path d="M3.5 7.2h17v1.25h-17z"/>' +
    '<path d="M11.2 8.2h1.6v9.4h-1.6z"/>' +
    '<path d="M7.2 8.45l3.9 4.4-.9.8-4.1-4.55zm9.6 0l-3.9 4.4.9.8 4.1-4.55z"/>' +
    '<path d="M10.3 14.8h3.4v3.6h-3.4z"/>' +
    '<path d="M9.4 18.2h5.2v1.15H9.4z"/>',

  // Multirotor UAV
  uav:
    '<rect x="10.2" y="9.4" width="3.6" height="3.6" rx="0.6"/>' +
    '<path d="M4.2 5.6h3.4v3.4H4.2zm12.2 0h3.4v3.4h-3.4zM4.2 14.8h3.4v3.4H4.2zm12.2 0h3.4v3.4h-3.4z"/>' +
    '<path d="M7.6 7.3l2.6 2.6M13.8 9.9l2.6-2.6M7.6 16.5l2.6-2.6m3.6 0l2.6 2.6"/>',
}

/**
 * Marker pixel size by kind — heavies read larger on the chart.
 * @type {Record<AircraftIconKind, number>}
 */
export const AIRCRAFT_ICON_SIZE = {
  light: 26,
  jet: 28,
  heavy: 32,
  superheavy: 36,
  heli: 28,
  glider: 30,
  ultralight: 26,
  uav: 24,
}

/**
 * @param {string} fill
 * @param {AircraftIconKind} kind
 * @param {number} [px]
 */
export const aircraftSvgMarkup = (fill, kind, px) => {
  const size = px ?? AIRCRAFT_ICON_SIZE[kind] ?? 28
  const body = AIRCRAFT_ICON_SVG[kind] || AIRCRAFT_ICON_SVG.jet
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">` +
    `<g fill="${fill}" stroke="#000" stroke-width="1" stroke-linejoin="miter" stroke-linecap="square" paint-order="stroke fill">${body}</g>` +
    '</svg>'
  )
}
