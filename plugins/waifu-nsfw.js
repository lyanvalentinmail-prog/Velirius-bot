import { apireonBuffer } from '../lib/apireon.js'

let handler = async (m, { conn }) => {
  try {
    const { buffer } = await apireonBuffer('/anime/neko')
    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        mentions: [m.sender],
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )
  } catch (error) {
    console.error('Error en comando neko:', error)
    m.reply('*[❗] Ocurrió un error al obtener la imagen. Inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#neko']
handler.tags = ['anime', 'nsfw']
handler.command = ['waifu18', 'neko']

export default handler
