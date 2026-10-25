import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `ִֶָ☾. Ingresa lo que deseas buscar en *Pinterest*.\n\n> *Ejemplo:* ${usedPrefix + command} anime aesthetic`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const consulta = text.trim()
  await m.react('⏳').catch(() => {})

  try {
    const { result, baseUrl } = await apireonJson('/search/pinterest', { query: consulta, limit: 20 })
    const pines = Array.isArray(result?.pins) ? result.pins : []

    if (!pines.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron pines para *${consulta}*.`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const elegido = pines[Math.floor(Math.random() * pines.length)]
    const urlImagen = apireonAbsUrl(elegido.image || elegido.thumbnail || '', baseUrl)
    if (!urlImagen) throw new Error('Pin sin imagen válida.')

    let leyenda = `ִֶָ☾. *Pinterest* ִֶָ☾.\n\n`
    leyenda += `𓍯 *Búsqueda:* ${consulta}\n`
    if (elegido.title) leyenda += `𓍯 *Título:* ${elegido.title}\n`
    if (elegido.author) leyenda += `𓍯 *Autor:* ${elegido.author}\n`
    if (elegido.pinUrl) leyenda += `𓍯 *Pin:* ${elegido.pinUrl}`

    await conn.sendMessage(m.chat, {
      image: { url: urlImagen },
      caption: leyenda.trim(),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[pinterest] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error buscando en Pinterest.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['pinterest <búsqueda>', 'pimg <búsqueda>']
handler.tags = ['descargas', 'buscador']
handler.command = ['pinterest', 'pimg']
handler.group = true

export default handler
