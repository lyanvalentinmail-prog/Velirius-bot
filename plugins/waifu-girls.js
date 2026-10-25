import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const CONSULTAS = [
  'aesthetic girl portrait photography',
  'cosplay anime girl portrait',
  'cyberpunk girl aesthetic portrait'
]

let handler = async (m, { conn }) => {
  try {
    const q = CONSULTAS[Math.floor(Math.random() * CONSULTAS.length)]
    const { result, baseUrl } = await apireonJson('/search/pinterest', { query: q, limit: 25 })
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
    console.error('Error en comando girls:', error)
    m.reply('*[❗] Ocurrió un error al obtener la imagen. Inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#girls', '#girls18']
handler.tags = ['nsfw']
handler.command = ['girls', 'girls18']

export default handler
