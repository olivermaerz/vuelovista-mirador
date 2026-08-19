import L from 'leaflet'

/** Recenter-on-user control (bottom-left; sized to match Controls FAB on narrow). */
export const LocateControl = L.Control.extend({
  options: { position: 'bottomleft' },

  onAdd(map) {
    const container = L.DomUtil.create(
      'div',
      'leaflet-bar leaflet-control leaflet-control-locate',
    )
    const link = L.DomUtil.create('a', 'leaflet-control-locate-button', container)
    link.href = '#'
    link.title = 'Center on my location'
    link.setAttribute('role', 'button')
    link.setAttribute('aria-label', 'Center on my location')
    link.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>' +
      '</svg>'

    L.DomEvent.disableClickPropagation(container)
    L.DomEvent.on(link, 'click', (event) => {
      L.DomEvent.preventDefault(event)
      map.fire('locate:request')
    })

    return container
  },
})
