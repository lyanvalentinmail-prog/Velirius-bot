import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const REGEX_URL_TT = /https?:\/\/(?:www\.|vm\.|vt\.|m\.)?tiktok\.com\/[^\s]+/i

function sanitizarUrlTikTok(crudo = '') {
  const limpio = String(crudo).trim().replace(/[>\])}.,;'"!]+$/, '')
  try {
    const url = new URL(limpio)
    if (url.hostname.includes('tiktok.com') && /\/(video|photo)\/\d+/.test(url.pathname)) {
      url.search = ''
      url.hash = ''
    }
    return url.toString()
  } catch {
    return limpio
  }
}

function urlMediaAbs(u = '', baseUrl) {
  return apireonAbsUrl(u, baseUrl)
}

function formatearNumero(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return String(n || 0)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}

async function descargarTikTok(urlVideo, tipo = 'video') {
  const descarga = await apireonBuffer('/downloader/tiktok', {
    url: urlVideo,
    type: tipo
  })
  return {
    buffer: descarga.buffer,
    contentType: descarga.contentType,
    title: descarga.title || 'TikTok',
    author: descarga.author || 'TikTok',
    url: urlVideo
  }
}

async function buscarTikTok(consulta, limite = 5) {
  const { result, baseUrl } = await apireonJson('/search/tiktok', {
    query: consulta,
    limit: limite
  })
  const lista = Array.isArray(result?.videos) ? result.videos : []
  if (!lista.length) {
    throw new Error('No se encontraron videos para esa búsqueda.')
  }
  return lista.map(v => ({
    id: v.id || '',
    title: v.title || 'Sin título',
    url: v.url || '',
    cover: apireonAbsUrl(v.cover || '', baseUrl),
    durationSeconds: v.durationSeconds || 0,
    stats: v.stats || {},
    author: {
      username: v.author?.username || 'usuario',
      nickname: v.author?.nickname || v.author?.username || 'TikTok',
      avatar: apireonAbsUrl(v.author?.avatar || '', baseUrl)
    }
  }))
}

function construirLeyendaItem(item) {
  const titulo = String(item?.title || 'Sin descripción').trim().slice(0, 260)
  const autor = item?.author?.nickname || item?.author?.username || 'TikTok'
  const usuario = item?.author?.username ? ` (@${item.author.username})` : ''
  const estadisticas = item?.stats || {}
  const reproducciones = estadisticas.views ? `▶ ${formatearNumero(estadisticas.views)}` : ''
  const likes = estadisticas.likes ? `❤️ ${formatearNumero(estadisticas.likes)}` : ''
  const comentarios = estadisticas.comments ? `💬 ${formatearNumero(estadisticas.comments)}` : ''
  const metricas = [reproducciones, likes, comentarios].filter(Boolean).join(' · ')

  return (
    `🎵 *TikTok*\n\n` +
    `👤 *Autor:* ${autor}${usuario}\n` +
    (metricas ? `📊 ${metricas}\n` : '') +
    `📝 ${titulo}`
  )
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const textoCitado = m.quoted?.text || m.quoted?.caption || ''
  const crudo = (text || textoCitado || '').trim()

  if (!crudo) {
    return conn.sendMessage(m.chat, {
      text:
        `[❗] Escribe un *enlace* o una *búsqueda* de TikTok.\n\n` +
        `> *Enlace:* ${usedPrefix + command} https://vm.tiktok.com/...\n` +
        `> *Buscar:* ${usedPrefix + command} gatos graciosos`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const coincidenciaUrl = crudo.match(REGEX_URL_TT)
  const pideAudio = /\b(mp3|audio)\b/i.test(crudo) && Boolean(coincidenciaUrl)
  await m.react('⏳').catch(() => {})

  try {
    if (coincidenciaUrl) {
      const urlLimpia = sanitizarUrlTikTok(coincidenciaUrl[0])
      const d = await descargarTikTok(urlLimpia, pideAudio ? 'audio' : 'video')

      if (pideAudio || d.contentType.startsWith('audio/')) {
        await conn.sendMessage(m.chat, {
          audio: d.buffer,
          mimetype: 'audio/mpeg',
          fileName: `${(d.title || 'tiktok').slice(0, 60)}.mp3`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      } else {
        const leyenda =
          `🎵 *TikTok Downloader*\n\n` +
          `👤 *Autor:* ${d.author || 'TikTok'}\n` +
          `📝 ${String(d.title || 'TikTok').slice(0, 260)}`

        await conn.sendMessage(m.chat, {
          video: d.buffer,
          mimetype: 'video/mp4',
          caption: leyenda,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }

      await m.react('✅').catch(() => {})
      return
    }

    const resultados = await buscarTikTok(crudo, 5)
    const elegido = resultados.find(r => r.url) || resultados[0]
    if (!elegido?.url) throw new Error('No se obtuvo enlace válido del resultado.')

    const d = await descargarTikTok(elegido.url, 'video')
    await conn.sendMessage(m.chat, {
      video: d.buffer,
      mimetype: 'video/mp4',
      caption: construirLeyendaItem(elegido),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[tiktok] Error:', e.message)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo procesar el TikTok.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['tiktok <url|búsqueda>', 'tt <url|búsqueda>']
handler.tags = ['descargas']
handler.command = ['tiktok', 'tt', 'ttsearch']
handler.group = true

export {
  sanitizarUrlTikTok,
  sanitizarUrlTikTok as sanitizeTikTokUrl,
  descargarTikTok,
  descargarTikTok as downloadTikTok,
  buscarTikTok,
  buscarTikTok as searchTikTok,
  urlMediaAbs,
  urlMediaAbs as absMedia
}
export default handler
