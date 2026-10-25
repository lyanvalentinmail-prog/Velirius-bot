import fetch from 'node-fetch'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs'
import { spawn } from 'child_process'

export const APIREON_PREVIEW_URL =
  'https://apireon-36er-git-arena-fd508da9-apireon-lyanvalentinmail3-4607.vercel.app'
export const APIREON_PROD_URL = 'https://apireon-36er.vercel.app'
export const APIREON_HOME_URL = `${APIREON_PREVIEW_URL}/home`

const SSO_COOLDOWN_MS = 5 * 60 * 1000
const ssoLockedHosts = new Map()

const DEFAULT_HEADERS = {
  'X-Apireon-Client': 'ui',
  Accept: 'application/json, image/*, video/*, audio/*, application/octet-stream, text/plain;q=0.8',
  'User-Agent': 'VeliriusBot/1.0'
}

function normalizarBase(url = '') {
  return String(url || '')
    .trim()
    .replace(/\/home\/?$/i, '')
    .replace(/\/+$/, '')
}

function normalizarRuta(endpointPath = '/') {
  const limpio = String(endpointPath || '/').trim()
  return limpio.startsWith('/') ? limpio : `/${limpio}`
}

function estaBloqueadoSso(base) {
  const expira = ssoLockedHosts.get(base)
  if (!expira) return false
  if (Date.now() > expira) {
    ssoLockedHosts.delete(base)
    return false
  }
  return true
}

function marcarBloqueadoSso(base) {
  ssoLockedHosts.set(base, Date.now() + SSO_COOLDOWN_MS)
}

export function obtenerBasesApireon() {
  const cfg = global.APIs?.apireon
  const crudos = []

  if (typeof cfg === 'string') {
    crudos.push(cfg)
  } else if (cfg && typeof cfg === 'object') {
    if (cfg.url) crudos.push(cfg.url)
    if (cfg.fallbackUrl) crudos.push(cfg.fallbackUrl)
    if (cfg.fallback) crudos.push(cfg.fallback)
  }

  crudos.push(APIREON_PREVIEW_URL, APIREON_PROD_URL)

  const unicos = [...new Set(crudos.map(normalizarBase).filter(Boolean))]
  const activos = unicos.filter(b => !estaBloqueadoSso(b))
  return activos.length ? activos : unicos
}

export function apireonUrl(endpointPath, params = {}, baseOverride = '') {
  const base = normalizarBase(baseOverride) || obtenerBasesApireon()[0] || APIREON_PROD_URL
  const ruta = normalizarRuta(endpointPath)
  const sp = new URLSearchParams()

  for (const [k, v] of Object.entries(params || {})) {
    if (v !== undefined && v !== null && String(v) !== '') {
      sp.set(k, String(v))
    }
  }

  const qs = sp.toString()
  return `${base}${ruta}${qs ? `?${qs}` : ''}`
}

export function apireonAbsUrl(maybeUrl = '', baseUsed = '') {
  const valor = String(maybeUrl || '').trim()
  if (!valor) return ''
  if (/^(https?:\/\/|data:)/i.test(valor)) return valor
  const base = normalizarBase(baseUsed) || obtenerBasesApireon()[0] || APIREON_PROD_URL
  return `${base}${valor.startsWith('/') ? valor : `/${valor}`}`
}

export function bufferToDataUrl(buffer, mime = 'image/png') {
  if (!Buffer.isBuffer(buffer) || !buffer.length) return ''
  const tipo = String(mime || 'image/png').split(';')[0].trim() || 'image/png'
  return `data:${tipo};base64,${buffer.toString('base64')}`
}

function decodificarCabecera(valor) {
  if (!valor) return ''
  try {
    return decodeURIComponent(valor)
  } catch {
    return String(valor)
  }
}

function pareceRespuestaSsoVercel(res, contentType = '', previewTexto = '') {
  const urlFinal = String(res?.url || '')
  if (urlFinal.includes('vercel.com/login') || urlFinal.includes('/sso-api')) return true
  if (res?.headers?.get?.('x-vercel-mitigation')) return true
  if ((res.status === 401 || res.status === 403) && contentType.includes('text/html')) return true
  if (
    contentType.includes('text/html') &&
    (/Protected Deployment|Log in to Vercel|_vercel_sso_nonce/i.test(previewTexto))
  ) {
    return true
  }
  return false
}

async function ejecutarFetchConTimeout(url, init = {}, timeoutMs = 45000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function apireonRaw(endpointPath, params = {}, options = {}) {
  const {
    method = options.body ? 'POST' : 'GET',
    body = null,
    headers = {},
    timeout = 45000
  } = options

  const bases = obtenerBasesApireon()
  let ultimoError = null

  for (const base of bases) {
    const url = apireonUrl(endpointPath, method === 'GET' ? params : {}, base)
    const reqHeaders = {
      ...DEFAULT_HEADERS,
      ...headers
    }

    let reqBody = undefined
    if (method !== 'GET' && body !== null && body !== undefined) {
      if (Buffer.isBuffer(body) || typeof body === 'string') {
        reqBody = body
      } else {
        reqHeaders['Content-Type'] = 'application/json'
        reqBody = JSON.stringify({ ...params, ...body })
      }
    }

    try {
      const res = await ejecutarFetchConTimeout(
        url,
        {
          method,
          headers: reqHeaders,
          body: reqBody,
          redirect: 'follow'
        },
        timeout
      )

      const contentType = String(res.headers.get('content-type') || '').toLowerCase()

      if (contentType.includes('text/html') || res.status === 401 || res.status === 403) {
        const clonTexto = await res.clone().text().catch(() => '')
        if (pareceRespuestaSsoVercel(res, contentType, clonTexto)) {
          marcarBloqueadoSso(base)
          ultimoError = new Error(`Deployment protegido por SSO en ${base}`)
          continue
        }
      }

      return { res, baseUrl: base, url, contentType }
    } catch (err) {
      ultimoError = err
    }
  }

  throw ultimoError || new Error('No se pudo conectar con Apireon API')
}

export async function apireonJson(endpointPath, params = {}, options = {}) {
  const { res, baseUrl, contentType } = await apireonRaw(endpointPath, params, options)
  const texto = await res.text()

  let payload
  try {
    payload = JSON.parse(texto)
  } catch {
    if (!res.ok) {
      throw new Error(`Apireon HTTP ${res.status}: ${texto.slice(0, 160)}`)
    }
    return {
      raw: { status: true, result: texto },
      result: texto,
      baseUrl,
      contentType
    }
  }

  if (!res.ok || payload?.status === false || payload?.error) {
    const msg = payload?.error || payload?.message || `Error HTTP ${res.status} en ${endpointPath}`
    throw new Error(msg)
  }

  const result =
    payload?.result !== undefined
      ? payload.result
      : payload?.data !== undefined
        ? payload.data
        : payload

  return { raw: payload, result, baseUrl, contentType }
}

function extraerUrlDeObjeto(obj, baseUrl) {
  if (!obj) return ''
  if (typeof obj === 'string') return apireonAbsUrl(obj, baseUrl)
  if (typeof obj !== 'object') return ''

  const claves = [
    'url',
    'download',
    'directDownloadUrl',
    'video',
    'audio',
    'play',
    'hdplay',
    'photo',
    'gifUrl',
    'artwork',
    'image',
    'imageUrl',
    'cardImageUrl',
    'photoUrl',
    'cover',
    'thumbnail'
  ]

  for (const k of claves) {
    const val = obj[k]
    if (typeof val === 'string' && val.trim()) {
      return apireonAbsUrl(val.trim(), baseUrl)
    }
    if (val && typeof val === 'object' && typeof val.url === 'string' && val.url.trim()) {
      return apireonAbsUrl(val.url.trim(), baseUrl)
    }
  }

  return ''
}

export async function apireonBuffer(endpointPath, params = {}, options = {}) {
  const { res, baseUrl, contentType } = await apireonRaw(endpointPath, params, {
    timeout: 60000,
    ...options
  })

  const title = decodificarCabecera(res.headers.get('x-media-title'))
  const author = decodificarCabecera(res.headers.get('x-media-author'))

  if (
    res.ok &&
    (contentType.startsWith('image/') ||
      contentType.startsWith('video/') ||
      contentType.startsWith('audio/') ||
      contentType.includes('octet-stream'))
  ) {
    const buffer = Buffer.from(await res.arrayBuffer())
    if (!buffer.length) throw new Error('Apireon devolvió un archivo vacío.')
    return { buffer, contentType, title, author, baseUrl, meta: null }
  }

  const texto = await res.text()
  let payload = null
  try {
    payload = JSON.parse(texto)
  } catch {
    throw new Error(
      !res.ok
        ? `Apireon HTTP ${res.status}: ${texto.slice(0, 140)}`
        : 'Apireon no devolvió un archivo multimedia válido.'
    )
  }

  if (!res.ok || payload?.status === false || payload?.error) {
    throw new Error(payload?.error || payload?.message || `Error HTTP ${res.status}`)
  }

  const resultado = payload?.result ?? payload?.data ?? payload
  const mediaRef = extraerUrlDeObjeto(resultado, baseUrl)

  if (!mediaRef) {
    throw new Error('No se encontró contenido multimedia en la respuesta de Apireon.')
  }

  if (mediaRef.startsWith('data:')) {
    const match = mediaRef.match(/^data:([^;]+);base64,(.+)$/)
    if (!match) throw new Error('Data URL inválida en respuesta de Apireon.')
    return {
      buffer: Buffer.from(match[2], 'base64'),
      contentType: match[1],
      title: resultado?.title || resultado?.name || title,
      author: resultado?.author || resultado?.artist || author,
      baseUrl,
      meta: resultado
    }
  }

  const mediaRes = await ejecutarFetchConTimeout(
    mediaRef,
    { headers: { 'User-Agent': DEFAULT_HEADERS['User-Agent'] } },
    options.timeout || 60000
  )
  if (!mediaRes.ok) {
    throw new Error(`No se pudo descargar el recurso multimedia (HTTP ${mediaRes.status}).`)
  }
  const buffer = Buffer.from(await mediaRes.arrayBuffer())
  const mediaType = String(mediaRes.headers.get('content-type') || 'application/octet-stream').toLowerCase()

  return {
    buffer,
    contentType: mediaType,
    title: resultado?.title || resultado?.name || title,
    author: resultado?.author || resultado?.artist || author,
    baseUrl,
    meta: resultado
  }
}

export async function apireonText(endpointPath, params = {}, options = {}) {
  const { res, baseUrl, contentType } = await apireonRaw(endpointPath, params, options)
  const texto = await res.text()

  if (contentType.includes('application/json')) {
    let payload
    try {
      payload = JSON.parse(texto)
    } catch {
      return { text: texto, baseUrl }
    }
    if (!res.ok || payload?.status === false || payload?.error) {
      throw new Error(payload?.error || payload?.message || `Error HTTP ${res.status}`)
    }
    const r = payload?.result ?? payload?.data ?? ''
    if (typeof r === 'string') return { text: r, raw: payload, baseUrl }
    const candidato = r?.lyrics || r?.text || r?.response || r?.reply || r?.translatedText || ''
    return { text: String(candidato || ''), raw: payload, result: r, baseUrl }
  }

  if (!res.ok) {
    throw new Error(`Apireon HTTP ${res.status}: ${texto.slice(0, 140)}`)
  }

  return { text: texto, baseUrl }
}

export async function enviarReaccionApireon(m, conn, { endpoint, texto, mencion = [] }) {
  const rutaEndpoint = `/reactions/${String(endpoint).replace(/^\/+/, '')}`
  const { buffer, contentType } = await apireonBuffer(rutaEndpoint)

  const contextInfo = {
    ...(global.rcanal?.contextInfo || {}),
    ...(mencion.length ? { mentionedJid: mencion } : {})
  }

  if (contentType.startsWith('video/')) {
    await conn.sendMessage(
      m.chat,
      { video: buffer, caption: texto, mimetype: 'video/mp4', gifPlayback: true, contextInfo },
      { quoted: m }
    )
    return
  }

  const sello = `reac_${endpoint}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const rutaGif = join(tmpdir(), `${sello}.gif`)
  const rutaMp4 = join(tmpdir(), `${sello}.mp4`)

  try {
    writeFileSync(rutaGif, buffer)
    await new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', [
        '-y',
        '-i',
        rutaGif,
        '-movflags',
        'faststart',
        '-pix_fmt',
        'yuv420p',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        rutaMp4
      ])
      let stderr = ''
      ff.stderr.on('data', d => { stderr += d.toString() })
      ff.on('close', code => {
        if (code === 0 && existsSync(rutaMp4)) resolve()
        else reject(new Error(stderr || `ffmpeg code ${code}`))
      })
      ff.on('error', reject)
    })

    const bufferMp4 = readFileSync(rutaMp4)
    await conn.sendMessage(
      m.chat,
      { video: bufferMp4, caption: texto, mimetype: 'video/mp4', gifPlayback: true, contextInfo },
      { quoted: m }
    )
  } catch {
    await conn.sendMessage(
      m.chat,
      { image: buffer, caption: texto, contextInfo },
      { quoted: m }
    )
  } finally {
    try { if (existsSync(rutaGif)) unlinkSync(rutaGif) } catch {}
    try { if (existsSync(rutaMp4)) unlinkSync(rutaMp4) } catch {}
  }
}
