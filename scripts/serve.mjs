import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ADSBLOL_PROXY_PREFIX,
  ADSBLOL_UPSTREAM,
} from '../adsblolProxy.config.js'
import {
  ADSBDB_PROXY_PREFIX,
  ADSBDB_UPSTREAM,
} from '../adsbdbProxy.config.js'
import {
  STANDING_DATA_PROXY_PREFIX,
  STANDING_DATA_UPSTREAM,
} from '../standingDataProxy.config.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const distDir = join(__dirname, '..', 'dist')
const port = Number(process.env.PORT) || 4173

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.ico': 'image/x-icon',
}

const send = (res, status, body, headers = {}) => {
  res.writeHead(status, headers)
  res.end(body)
}

const proxyAdsblol = async (req, res) => {
  const upstreamPath = req.url.slice(ADSBLOL_PROXY_PREFIX.length) || '/'
  const upstreamUrl = `${ADSBLOL_UPSTREAM}${upstreamPath}`

  try {
    const upstream = await fetch(upstreamUrl)
    const buffer = Buffer.from(await upstream.arrayBuffer())
    const headers = {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'no-store',
    }
    send(res, upstream.status, buffer, headers)
  } catch (err) {
    send(res, 502, `adsb.lol proxy error: ${err.message}`, {
      'Content-Type': 'text/plain; charset=utf-8',
    })
  }
}

const proxyAdsbdb = async (req, res) => {
  const upstreamPath = req.url.slice(ADSBDB_PROXY_PREFIX.length) || '/'
  const upstreamUrl = `${ADSBDB_UPSTREAM}${upstreamPath}`

  try {
    const upstream = await fetch(upstreamUrl)
    const buffer = Buffer.from(await upstream.arrayBuffer())
    const headers = {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'public, max-age=3600',
    }
    send(res, upstream.status, buffer, headers)
  } catch (err) {
    send(res, 502, `adsbdb proxy error: ${err.message}`, {
      'Content-Type': 'text/plain; charset=utf-8',
    })
  }
}

const proxyStandingData = async (req, res) => {
  const upstreamPath = req.url.slice(STANDING_DATA_PROXY_PREFIX.length) || '/'
  const upstreamUrl = `${STANDING_DATA_UPSTREAM}${upstreamPath}`

  try {
    const upstream = await fetch(upstreamUrl)
    const buffer = Buffer.from(await upstream.arrayBuffer())
    const headers = {
      'Content-Type': upstream.headers.get('content-type') || 'application/json',
      'Cache-Control': 'public, max-age=3600',
    }
    send(res, upstream.status, buffer, headers)
  } catch (err) {
    send(res, 502, `standing-data proxy error: ${err.message}`, {
      'Content-Type': 'text/plain; charset=utf-8',
    })
  }
}

const serveStatic = async (req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
  const relative = urlPath === '/' ? '/index.html' : urlPath
  const filePath = join(distDir, relative)

  if (!filePath.startsWith(distDir)) {
    send(res, 403, 'Forbidden')
    return
  }

  try {
    const body = await readFile(filePath)
    send(res, 200, body, {
      'Content-Type': mime[extname(filePath)] || 'application/octet-stream',
    })
  } catch {
    // SPA fallback
    try {
      const body = await readFile(join(distDir, 'index.html'))
      send(res, 200, body, { 'Content-Type': mime['.html'] })
    } catch {
      send(res, 404, 'Not found. Run yarn build first.', {
        'Content-Type': 'text/plain; charset=utf-8',
      })
    }
  }
}

createServer(async (req, res) => {
  const url = req.url || ''
  if (url.startsWith(ADSBLOL_PROXY_PREFIX)) {
    await proxyAdsblol(req, res)
    return
  }
  if (url.startsWith(ADSBDB_PROXY_PREFIX)) {
    await proxyAdsbdb(req, res)
    return
  }
  if (url.startsWith(STANDING_DATA_PROXY_PREFIX)) {
    await proxyStandingData(req, res)
    return
  }
  await serveStatic(req, res)
}).listen(port, () => {
  console.log(`Production server: http://localhost:${port}`)
  console.log(`Serving ${distDir}`)
  console.log(`  ${ADSBLOL_PROXY_PREFIX} → ${ADSBLOL_UPSTREAM}`)
  console.log(`  ${ADSBDB_PROXY_PREFIX} → ${ADSBDB_UPSTREAM}`)
  console.log(`  ${STANDING_DATA_PROXY_PREFIX} → ${STANDING_DATA_UPSTREAM}`)
})
