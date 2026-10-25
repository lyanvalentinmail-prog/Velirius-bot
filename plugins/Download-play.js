import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const handler = async (m, { conn, text, usedPrefix }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: ' ִֶָ☾. Ingresa el nombre, número o enlace de YouTube.',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const entrada = text.trim()
    const esUrl = /youtu\.be|youtube\.com/i.test(entrada)

    let urlVideo = ''
    let titulo = 'Audio'
    let canal = 'YouTube'
    let duracion = '—'
    let urlMiniatura = ''

    if (esUrl) {
      urlVideo = entrada
      try {
        const { result, baseUrl } = await apireonJson('/search/youtube', { query: entrada, limit: 1 })
        const primero = Array.isArray(result?.videos) ? result.videos[0] : null
        if (primero) {
          titulo = primero.title || titulo
          canal = primero.channel?.name || primero.authorName || primero.author || canal
          duracion = primero.duration || duracion
          urlMiniatura = apireonAbsUrl(primero.thumbnail || primero.image || '', baseUrl)
        }
      } catch {}
    } else if (/^\d+$/.test(entrada)) {
      const idx = parseInt(entrada, 10) - 1
      const cacheBusqueda = global.lastYtSearch?.[m.sender]
      if (!cacheBusqueda?.results?.length || Date.now() - cacheBusqueda.at > 10 * 60 * 1000) {
        throw `[❗] No hay búsqueda reciente. Usa primero *${usedPrefix}yt <texto>*`
      }
      if (idx < 0 || idx >= cacheBusqueda.results.length) {
        throw `[❗] Elige un número del 1 al ${cacheBusqueda.results.length}.`
      }
      const elegido = cacheBusqueda.results[idx]
      urlVideo = elegido.url
      titulo = elegido.title || titulo
      canal = elegido.author || canal
      duracion = elegido.duration || duracion
      urlMiniatura = elegido.image || ''
    } else {
      const { result, baseUrl } = await apireonJson('/search/youtube', { query: entrada, limit: 1 })
      const lista = Array.isArray(result?.videos) ? result.videos : []
      if (!lista.length) {
        throw '[❗] No se encontraron resultados para la búsqueda.'
      }
      const primero = lista[0]
      urlVideo = primero.url || (primero.videoId ? `https://youtu.be/${primero.videoId}` : '')
      titulo = primero.title || titulo
      canal = primero.channel?.name || primero.authorName || primero.author || canal
      duracion = primero.duration || duracion
      urlMiniatura = apireonAbsUrl(primero.thumbnail || primero.image || '', baseUrl)
    }

    let descarga
    try {
      descarga = await apireonBuffer('/downloader/play', { query: urlVideo || entrada })
    } catch {
      descarga = await apireonBuffer('/downloader/youtube', { url: urlVideo || entrada, quality: 'mp3' })
    }

    titulo = descarga.title || titulo
    canal = descarga.author || canal

    const informacion = `ִֶָ☾. 𝗣𝗹𝗮𝘆 ִֶָ☾.
 𓍯  *Título:* ${titulo}
 𓍯  *Canal:* ${canal}
 𓍯  *Duración:* ${duracion}
 𓍯  *Enlace:* ${urlVideo || entrada}`

    if (urlMiniatura && /^https?:\/\//i.test(urlMiniatura)) {
      try {
        const miniatura = (await conn.getFile(urlMiniatura)).data
        await conn.sendMessage(
          m.chat,
          { image: miniatura, caption: informacion, contextInfo: { ...rcanal?.contextInfo } },
          { quoted: m }
        )
      } catch {
        await conn.sendMessage(
          m.chat,
          { text: informacion, contextInfo: { ...rcanal?.contextInfo } },
          { quoted: m }
        )
      }
    } else {
      await conn.sendMessage(
        m.chat,
        { text: informacion, contextInfo: { ...rcanal?.contextInfo } },
        { quoted: m }
      )
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: descarga.buffer,
        fileName: `${titulo}.mp3`,
        mimetype: 'audio/mpeg'
      },
      { quoted: m }
    )
  } catch (e) {
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string'
        ? e
        : `[❌] Se ha producido un problema.\n\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.command = ['play', 'ytmp3', 'playaudio']
handler.tags = ['descargas']
handler.group = true

export default handler
