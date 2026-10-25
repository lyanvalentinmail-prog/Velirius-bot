import { apireonJson, apireonRaw } from '../lib/apireon.js'
import { addExif } from '../lib/sticker.js'
import { toWebp, isAnimatedWebP } from './stickers-sticker.js'

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
  try {
    const consulta = (text || args.join(' ') || '').trim()
    if (!consulta) {
      return conn.reply(
        m.chat,
        `ִֶָ☾. Ingresa un término para buscar stickers.\n\n> *Ejemplo:* ${usedPrefix + command} gato`,
        m,
        rcanal
      )
    }

    await m.react('⏳').catch(() => {})

    const { result, baseUrl } = await apireonJson('/search/stickerly', { query: consulta, limit: 8 })
    const packs = Array.isArray(result?.packs) ? result.packs : []
    if (!packs.length) {
      await m.react('❌').catch(() => {})
      return conn.reply(m.chat, '[❗] No se encontraron stickers para: ' + consulta, m, rcanal)
    }

    const candidatos = []
    for (const pack of packs) {
      const listaStickers = Array.isArray(pack?.stickers) ? pack.stickers : []
      for (const s of listaStickers) {
        if (s?.url) {
          candidatos.push({
            url: s.url,
            packName: pack.name || consulta,
            animated: Boolean(s.isAnimated || pack.isAnimated)
          })
        }
      }
      if (!listaStickers.length && pack?.trayIcon) {
        candidatos.push({
          url: pack.trayIcon,
          packName: pack.name || consulta,
          animated: Boolean(pack.isAnimated)
        })
      }
    }

    if (!candidatos.length) {
      await m.react('❌').catch(() => {})
      return conn.reply(m.chat, '[❗] Los paquetes encontrados no contienen imágenes válidas.', m, rcanal)
    }

    for (let i = candidatos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[candidatos[i], candidatos[j]] = [candidatos[j], candidatos[i]]
    }

    const nombreUsuario = '@' + (conn.getName(m.sender) || 'Usuario')
    let enviados = 0

    for (const item of candidatos.slice(0, 6)) {
      if (enviados >= 3) break
      try {
        let bufer
        if (/^https?:\/\//i.test(item.url) && !item.url.startsWith(baseUrl)) {
          const resp = await fetch(item.url)
          if (!resp.ok) continue
          bufer = Buffer.from(await resp.arrayBuffer())
        } else {
          const { res } = await apireonRaw(item.url)
          if (!res.ok) continue
          bufer = Buffer.from(await res.arrayBuffer())
        }

        const webp = await toWebp(bufer)
        const nombrePack = item.packName || consulta
        const autor = `${nombreUsuario}\n${global.namebot || 'Velirius bot'}`
        const stickerFinal = await addExif(webp, nombrePack, autor)
        const animado = isAnimatedWebP(stickerFinal)

        await conn.sendMessage(
          m.chat,
          {
            sticker: stickerFinal,
            ...(animado ? { isAnimated: true } : {}),
            contextInfo: rcanal?.contextInfo
          },
          { quoted: m }
        )
        enviados++
      } catch (err) {
        console.error('[search-sticker] Error procesando sticker:', err.message)
      }
    }

    if (enviados === 0) {
      await m.react('❌').catch(() => {})
      return conn.reply(m.chat, '[❌] No se pudieron generar stickers.', m, rcanal)
    }

    await m.react('✅').catch(() => {})
  } catch (error) {
    console.error('Error en search-sticker:', error)
    await m.react('❌').catch(() => {})
    return conn.reply(m.chat, '[❌] Error al buscar stickers.', m, rcanal)
  }
}

handler.help = ['search-sticker <término>', 'stickerly <término>']
handler.tags = ['stickers']
handler.command = ['search-sticker', 'bsticker', 'sticker-search', 'stickerly', 'ssearch']

export default handler
