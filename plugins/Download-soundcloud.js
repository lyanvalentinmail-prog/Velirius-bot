import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. Ingresa el nombre o enlace de la canción.\n\n> *Ejemplo:* ${usedPrefix + command} After Dark`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await m.react('⏳').catch(() => {})
    const entrada = text.trim()

    let titulo = entrada
    let artista = 'SoundCloud'
    let duracion = '—'
    let miniatura = ''
    let consultaDescarga = entrada

    if (/^\d+$/.test(entrada)) {
      const idx = parseInt(entrada, 10) - 1
      const cache = global.lastScSearch?.[m.sender]
      if (!cache?.results?.length || Date.now() - cache.at > 10 * 60 * 1000) {
        throw `[❗] No hay búsqueda reciente. Usa primero *${usedPrefix}scs <canción>*`
      }
      if (idx < 0 || idx >= cache.results.length) {
        throw `[❗] Elige un número del 1 al ${cache.results.length}.`
      }
      const elegido = cache.results[idx]
      titulo = elegido.title || titulo
      artista = elegido.artist || artista
      duracion = elegido.duration || duracion
      miniatura = elegido.image || ''
      consultaDescarga = `${titulo} ${artista}`
    } else if (!/^https?:\/\//i.test(entrada)) {
      try {
        const { result, baseUrl } = await apireonJson('/search/spotify', { query: entrada, limit: 1 })
        const pista = Array.isArray(result?.tracks) ? result.tracks[0] : null
        if (pista) {
          titulo = pista.title || titulo
          artista = pista.artist || artista
          duracion = pista.durationFormatted || duracion
          miniatura = apireonAbsUrl(pista.artwork || '', baseUrl)
          consultaDescarga = `${titulo} ${artista}`
        }
      } catch {}
    }

    const descarga = await apireonBuffer('/downloader/play', { query: consultaDescarga })
    titulo = descarga.title || titulo
    artista = descarga.author || artista

    const leyenda = `ִֶָ☾. *SoundCloud Play* ִֶָ☾.

𓍯 *Título:* ${titulo}
𓍯 *Artista:* ${artista}
𓍯 *Duración:* ${duracion}`

    if (miniatura) {
      await conn.sendMessage(m.chat, {
        image: { url: miniatura },
        caption: leyenda,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m }).catch(async () => {
        await conn.sendMessage(m.chat, { text: leyenda, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
      })
    } else {
      await conn.sendMessage(m.chat, {
        text: leyenda,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      audio: descarga.buffer,
      fileName: `${titulo}.mp3`,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[soundcloud] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo obtener el audio.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['soundcloud <canción>', 'sc <canción>']
handler.tags = ['descargas']
handler.command = ['soundcloud', 'sc']
handler.group = true

export default handler
