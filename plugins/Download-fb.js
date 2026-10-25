import { apireonBuffer, apireonJson } from '../lib/apireon.js'

const REGEX_FB = /https?:\/\/(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.watch)\/[^\s]+/i

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `[❗] Ingresa un enlace o búsqueda de *Facebook*\n\n> Ejemplo:\n${usedPrefix + command} https://www.facebook.com/watch/?v=10153231379946729`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  try {
    const entrada = text.trim()
    let enlace = entrada.match(REGEX_FB)?.[0] || (REGEX_FB.test(args[0] || '') ? args[0] : '')

    if (!enlace) {
      const { result } = await apireonJson('/search/facebook', { query: entrada, limit: 5 })
      const lista = result?.results || result?.items || result?.videos || []
      if (!Array.isArray(lista) || !lista.length) {
        return conn.sendMessage(m.chat, {
          text: `[❗] No se encontraron resultados en Facebook para: *${entrada}*`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const primeroConUrl = lista.find(x => x?.url && REGEX_FB.test(x.url))
      if (!primeroConUrl) {
        let textoLista = `ִֶָ☾. *Resultados de Facebook*\n\n`
        lista.slice(0, 5).forEach((it, idx) => {
          textoLista += `*${idx + 1}.* ${it.title || it.name || 'Publicación'}\n> ${it.url || ''}\n\n`
        })
        return conn.sendMessage(m.chat, {
          text: textoLista.trim(),
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      enlace = primeroConUrl.url
    }

    const calidad = /\bmp3\b/i.test(entrada) ? 'mp3' : /\bsd\b/i.test(entrada) ? 'sd' : 'hd'
    const { buffer, contentType, title, author } = await apireonBuffer('/downloader/facebook', {
      url: enlace,
      quality: calidad
    })

    if (calidad === 'mp3' || contentType.startsWith('audio/')) {
      await conn.sendMessage(m.chat, {
        audio: buffer,
        fileName: 'facebook.mp3',
        mimetype: 'audio/mpeg',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
      return
    }

    const leyenda =
      `𓂃 ࣪ ִֶָ☾. *Aquí está tu video de Facebook*\n\n` +
      `> *Título:* ${title || 'Video de Facebook'}\n` +
      (author ? `> *Autor:* ${author}\n` : '') +
      `> *Calidad:* ${calidad.toUpperCase()}`

    await conn.sendMessage(m.chat, {
      video: buffer,
      fileName: 'facebook.mp4',
      mimetype: 'video/mp4',
      caption: leyenda,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en Facebook:', e)
    await conn.sendMessage(m.chat, {
      text: `[❗] Se produjo un error al procesar Facebook.\n\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['facebook <url>', 'fb <url>']
handler.tags = ['downloader']
handler.command = ['facebook', 'fb']
handler.group = true

export default handler
