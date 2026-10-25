import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const CONSULTAS = [
  'korean model aesthetic portrait',
  'ulzzang korean girl aesthetic',
  'kpop idol photoshoot portrait'
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
    console.error('Error en comando corean:', error)
    m.reply('*[❗] Ocurrió un error al obtener la imagen. Inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#corean', '#coreanas']
handler.tags = ['nsfw']
handler.command = ['corean', 'coreanas']

export default handler
