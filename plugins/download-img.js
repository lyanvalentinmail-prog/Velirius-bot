import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `ִֶָ☾. Ingresa lo que deseas buscar en imágenes.\n\n> *Ejemplo:* ${usedPrefix + command} paisaje cyberpunk`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const consulta = text.trim()
  await m.react('⏳').catch(() => {})

  try {
    const { result, baseUrl } = await apireonJson('/search/pinterest', { query: consulta, limit: 15 })
    const pines = Array.isArray(result?.pins) ? result.pins : []

    if (!pines.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron imágenes para *${consulta}*.`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const elegido = pines[Math.floor(Math.random() * pines.length)]
    const urlImagen = apireonAbsUrl(elegido.image || elegido.thumbnail || '', baseUrl)
    if (!urlImagen) throw new Error('No se obtuvo URL de imagen.')

    const leyenda =
      `ִֶָ☾. *Imagen encontrada*\n\n` +
      `𓍯 *Búsqueda:* ${consulta}` +
      (elegido.title ? `\n𓍯 *Título:* ${elegido.title}` : '')

    await conn.sendMessage(m.chat, {
      image: { url: urlImagen },
      caption: leyenda,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[download-img] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo obtener la imagen.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['imagen <texto>', 'gimage <texto>']
handler.tags = ['descargas', 'buscador']
handler.command = ['imagen', 'gimage', 'buscarimg']
handler.group = true

export default handler
