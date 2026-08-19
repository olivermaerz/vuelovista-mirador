import L from 'leaflet'
import { httpFetch } from '../../net/http.js'

const punchChartPadding = (imageData) => {
  const w = imageData.width
  const h = imageData.height
  const data = imageData.data
  const visited = new Uint8Array(w * h)
  const stack = []

  const isPadding = (i) => {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const nearWhite = r > 242 && g > 242 && b > 242
    const nearBlack = r < 40 && g < 40 && b < 40
    return nearWhite || nearBlack
  }

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return
    const idx = y * w + x
    if (visited[idx]) return
    if (!isPadding(idx * 4)) return
    visited[idx] = 1
    stack.push(idx)
  }

  for (let x = 0; x < w; x++) {
    tryPush(x, 0)
    tryPush(x, h - 1)
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y)
    tryPush(w - 1, y)
  }

  while (stack.length) {
    const p = stack.pop()
    const px = p % w
    const py = (p - px) / w
    data[p * 4 + 3] = 0
    tryPush(px + 1, py)
    tryPush(px - 1, py)
    tryPush(px, py + 1)
    tryPush(px, py - 1)
  }
}

/** Raster chart tiles with edge-connected white/black padding punched transparent. */
export const TransparentJpegLayer = L.TileLayer.extend({
  createTile(coords, done) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    let objectUrl = null

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
    }

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      cleanup()

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        punchChartPadding(imageData)
        ctx.putImageData(imageData, 0, 0)
      } catch {
        // CORS-tainted canvas: show tile as-is
      }

      done(null, canvas)
    }

    img.onerror = () => {
      cleanup()
      done(new Error('Chart tile failed to load'), canvas)
    }

    const tileUrl = this.getTileUrl(coords)
    const fetchHeaders =
      typeof this.options.fetchHeaders === 'function'
        ? this.options.fetchHeaders()
        : this.options.fetchHeaders
    httpFetch(tileUrl, {
      responseType: 'arraybuffer',
      ...(fetchHeaders ? { headers: fetchHeaders } : {}),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`tile HTTP ${res.status}`)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        img.src = objectUrl
      })
      .catch((err) => {
        cleanup()
        done(err instanceof Error ? err : new Error('Chart tile failed to load'), canvas)
      })

    return canvas
  },
})
