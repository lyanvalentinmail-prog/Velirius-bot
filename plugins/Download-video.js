import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const RE_URL_YT = /youtu\.be|youtube\.com/i

function recortarTexto(text = '', max = 100) {
  const valor = String(text).replace(/\s+/g, ' ').trim()
  if (!valor || valor === '-') return ''
  return valor.length > max ? `${valor.slice(0, max - 1)}…` : valor
}

function normalizarFormato(crudo = '720') {
  const valor = String(crudo).trim().toLowerCase().replace(/p$/, '')
  if (['360', '480', '720', '1080'].includes(valor)) return `${valor}p`
  return '720p'
}

function formatearVistas(n) {
  if (typeof n === 'string' && /[KMB]/i.test(n)) return n
  const v = Number(n) || 0
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v || '—')
}

function limpiarNombreArchivo(titulo = 'video') {
  return String(titulo)
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80) || 'video'
}

async function buscarPrimero(consulta) {
  const { result, baseUrl } = await apireonJson('/search/youtube', { query: consulta, limit: 1 })
  const lista = Array.isArray(result?.videos) ? result.videos : []
  if (!lista.length) {
    throw '[❗] No se encontraron resultados para la búsqueda.'
  }
  const primero = lista[0]
  return {
    ...primero,
    image: apireonAbsUrl(primero.thumbnail || primero.image || '', baseUrl)
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. Ingresa búsqueda, enlace o número.\n\n> ${usedPrefix + command} <búsqueda>\n> ${usedPrefix + command} <enlace>\n> ${usedPrefix + command} <número>\n\n> *Ejemplo:*\n${usedPrefix + command} its you`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    let entrada = text.trim()
    let formato = '720p'

    const coincidenciaFormato = entrada.match(/^(.+?)\s*(?:\||\s)\s*(\d{3,4})p?$/i)
    if (coincidenciaFormato) {
      entrada = coincidenciaFormato[1].trim()
      formato = normalizarFormato(coincidenciaFormato[2])
    }

    let urlVideo = null
    let vistaPrevia = null

    if (RE_URL_YT.test(entrada)) {
      urlVideo = entrada
      try {
        vistaPrevia = await buscarPrimero(entrada)
      } catch {}
    } else if (/^\d+$/.test(entrada)) {
      const indice = parseInt(entrada, 10) - 1
      const cacheBusqueda = global.lastYtSearch?.[m.sender]
      if (!cacheBusqueda?.results?.length || Date.now() - cacheBusqueda.at > 10 * 60 * 1000) {
        throw `[❗] No hay búsqueda reciente. Usa primero *${usedPrefix}yt <texto>*`
      }
      if (indice < 0 || indice >= cacheBusqueda.results.length) {
        throw `[❗] Elige un número del 1 al ${cacheBusqueda.results.length}.`
      }
      urlVideo = cacheBusqueda.results[indice].url
      vistaPrevia = cacheBusqueda.results[indice]
    } else {
      const primero = await buscarPrimero(entrada)
      urlVideo = primero.url || (primero.videoId ? `https://youtu.be/${primero.videoId}` : entrada)
      vistaPrevia = primero
    }

    await conn.sendPresenceUpdate('composing', m.chat).catch(() => {})

    let descarga
    try {
      descarga = await apireonBuffer('/downloader/youtube', {
        url: urlVideo,
        quality: formato
      })
    } catch {
      descarga = await apireonBuffer('/downloader/play2', {
        query: urlVideo,
        type: 'video'
      })
    }

    const titulo = descarga.title || vistaPrevia?.title || 'Video'
    const canal =
      descarga.author ||
      vistaPrevia?.channel?.name ||
      vistaPrevia?.authorName ||
      vistaPrevia?.author ||
      'YouTube'
    const duracion = vistaPrevia?.duration || '—'

    const informacion = `ִֶָ☾. 𝗩𝗶𝗱𝗲𝗼 ִֶָ☾.
 𓍯  *Título:* ${recortarTexto(titulo, 90)}
 𓍯  *Canal:* ${recortarTexto(canal, 50)}
 𓍯  *Duración:* ${duracion}
 𓍯  *Vistas:* ${formatearVistas(vistaPrevia?.views)}
 𓍯  *Formato:* ${formato}
 𓍯  *Enlace:* ${urlVideo}`

    await conn.sendMessage(m.chat, {
      video: descarga.buffer,
      caption: informacion,
      fileName: `${limpiarNombreArchivo(titulo)}.mp4`,
      mimetype: 'video/mp4',
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await conn.sendPresenceUpdate('paused', m.chat).catch(() => {})
  } catch (e) {
    console.error('Error en download-video:', e)
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string'
        ? e
        : `[❌] Se ha producido un problema.\n\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['video <búsqueda/url/número>', 'ytmp4 <enlace>']
handler.command = ['download', 'downloadvideo', 'ytmp4', 'video', 'ytvideo']
handler.tags = ['descargas']
handler.group = true

export default handler
