import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const TEMAS_MEMES = [
  'memes en español graciosos',
  'memes latinos humor random',
  'shitpost español memes',
  'memes graciosos latam'
]

let handler = async (m, { conn, text }) => {
  try {
    await m.react('⏳').catch(() => {})

    const consulta = text?.trim()
      ? `meme español ${text.trim()}`
      : TEMAS_MEMES[Math.floor(Math.random() * TEMAS_MEMES.length)]

    const { result, baseUrl } = await apireonJson('/search/pinterest', {
      query: consulta,
      limit: 25
    })

    const pines = (Array.isArray(result?.pins) ? result.pins : []).filter(p => p?.image || p?.thumbnail)
    if (!pines.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: '*[❗] No pude obtener un meme ahora. Intentá de nuevo en unos segundos.*',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const elegido = pines[Math.floor(Math.random() * pines.length)]
    const url = apireonAbsUrl(elegido.image || elegido.thumbnail, baseUrl)
    const titulo = String(elegido.title || 'Meme').trim().slice(0, 180)
    const leyenda = `😂 *${titulo}*`

    await conn.sendMessage(
      m.chat,
      {
        image: { url },
        caption: leyenda,
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('Error en comando meme:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: '*[❗] Ocurrió un error al buscar el meme. Intentá de nuevo.*',
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['.meme [tema]']
handler.tags = ['fun']
handler.command = ['meme', 'memes', 'memito', 'memerandom']

export default handler
