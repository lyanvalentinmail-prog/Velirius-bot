import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const handler = async (m, { conn, text, usedPrefix }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `[❗] Uso incorrecto.\n> *Ejemplo:* ${usedPrefix}play2 <canción>`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  try {
    const consulta = text.trim()
    let meta = null
    let miniatura = ''

    try {
      const { result, baseUrl } = await apireonJson('/search/youtube', { query: consulta, limit: 1 })
      meta = Array.isArray(result?.videos) ? result.videos[0] : null
      if (meta) {
        miniatura = apireonAbsUrl(meta.thumbnail || meta.image || '', baseUrl)
      }
    } catch {}

    const descarga = await apireonBuffer('/downloader/play2', {
      query: meta?.url || consulta,
      type: 'audio'
    })

    const titulo = descarga.title || meta?.title || consulta
    const autor = descarga.author || meta?.channel?.name || meta?.authorName || 'YouTube'
    const duracion = meta?.duration || '—'
    const enlace = meta?.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(consulta)}`

    await conn.sendMessage(m.chat, {
      audio: descarga.buffer,
      fileName: `${titulo}.mp3`,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: `ִֶָ☾. 𝐓𝐢𝐭𝐮𝐥𝐨: ${titulo}`,
          body: `ִֶָ☾. 𝐀𝐮𝐭𝐨𝐫: ${autor} | 𝐃𝐮𝐫𝐚𝐜𝐢𝐨́𝐧: ${duracion}`,
          ...(miniatura ? { thumbnailUrl: miniatura } : {}),
          mediaType: 4,
          renderLargerThumbnail: false,
          sourceUrl: enlace
        }
      }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en play2:', e)
    await conn.sendMessage(m.chat, {
      text: `[❌] *Error:* ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.command = ['play2', 'music2', 'song2', 'audio2']
handler.tags = ['musica', 'audio', 'entretenimiento']
handler.help = ['play2 <canción> - Reproducir música desde YouTube']

export default handler
