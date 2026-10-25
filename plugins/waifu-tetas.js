import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

let handler = async (m, { conn }) => {
  try {
    const { result, baseUrl } = await apireonJson('/search/pinterest', {
      query: 'anime cosplay model glamour',
      limit: 25
    })
    const pines = Array.isArray(result?.pins) ? result.pins : []
    if (!pines.length) {
      return m.reply('*[❗] No se pudo obtener la imagen. Intenta de nuevo más tarde.*')
    }

    const elegido = pines[Math.floor(Math.random() * pines.length)]
    const urlImagen = apireonAbsUrl(elegido.image || elegido.thumbnail || '', baseUrl)

    await conn.sendMessage(
      m.chat,
      {
        image: { url: urlImagen },
        mentions: [m.sender],
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )
  } catch (error) {
    console.error('Error en comando tetas:', error)
    m.reply('*[❗] Ocurrió un error al obtener la imagen. Inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#tetas', '#tch', '#ts']
handler.tags = ['nsfw']
handler.command = ['tetas', 'tch', 'ts']

export default handler
