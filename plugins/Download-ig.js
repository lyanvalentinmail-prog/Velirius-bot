import { apireonBuffer, apireonJson } from '../lib/apireon.js'

const REGEX_URL_IG = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:reel|reels|p|tv)\/[\w-]+/i

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `[❗] Ingresa un enlace o búsqueda de Instagram Reels.\n\n> *URL:*\n${usedPrefix + command} https://www.instagram.com/reel/...\n\n> *Búsqueda:*\n${usedPrefix + command} nasa`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const consulta = text.trim()
    let urlReel = consulta.match(REGEX_URL_IG)?.[0]
    if (urlReel && !/^https?:\/\//i.test(urlReel)) urlReel = `https://${urlReel}`

    if (!urlReel) {
      const { result } = await apireonJson('/search/instagram', { query: consulta, limit: 5 })
      const lista = result?.results || result?.items || []
      const reelItem = lista.find(it => REGEX_URL_IG.test(it?.url || ''))

      if (!reelItem) {
        if (Array.isArray(lista) && lista.length) {
          let texto = `ִֶָ☾. *Resultados de Instagram*\n\n`
          lista.slice(0, 5).forEach((it, idx) => {
            texto += `*${idx + 1}.* ${it.title || it.username || 'Instagram'}\n`
            if (it.description) texto += `> ${it.description}\n`
            if (it.url) texto += `> ${it.url}\n`
            texto += '\n'
          })
          return conn.sendMessage(m.chat, {
            text: texto.trim(),
            contextInfo: { ...rcanal?.contextInfo }
          }, { quoted: m })
        }
        throw '[❗] No se encontraron resultados en Instagram para esa búsqueda.'
      }

      urlReel = reelItem.url
    }

    const tipo = /\baudio|mp3\b/i.test(consulta) ? 'audio' : 'video'
    const { buffer, contentType, title, author } = await apireonBuffer('/downloader/instagram', {
      url: urlReel,
      type: tipo
    })

    if (tipo === 'audio' || contentType.startsWith('audio/')) {
      await conn.sendMessage(m.chat, {
        audio: buffer,
        fileName: 'instagram.mp3',
        mimetype: 'audio/mpeg',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
      return
    }

    let leyenda = `> *${title || 'Instagram Reel'}*`
    if (author) leyenda += `\n> *Autor:* ${author}`
    leyenda += `\n> *Enlace:* ${urlReel}`

    if (contentType.startsWith('image/')) {
      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: leyenda,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        video: buffer,
        fileName: 'instagram.mp4',
        mimetype: 'video/mp4',
        caption: leyenda,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }
  } catch (e) {
    console.error('Error en Instagram:', e)
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string'
        ? e
        : `[❗] Se produjo un error al procesar Instagram.\n\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['instagram <url|búsqueda>', 'ig <url|búsqueda>']
handler.tags = ['downloader']
handler.command = ['instagram', 'ig']
handler.group = true

export default handler
