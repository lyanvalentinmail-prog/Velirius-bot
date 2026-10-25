import { apireonBuffer } from '../lib/apireon.js'

let handler = async (m, { conn }) => {
  try {
    const { buffer } = await apireonBuffer('/anime/waifu')

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: `ִֶָ☾. *Waifu — Velirius bot*`,
        mentions: [m.sender],
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )
  } catch (error) {
    console.error('Error en comando waifu:', error)
    await conn.sendMessage(
      m.chat,
      {
        text: '*[❗] Ocurrió un error al obtener la imagen de waifu. Inténtalo de nuevo más tarde.*',
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )
  }
}

handler.help = ['#waifu']
handler.tags = ['anime', 'nsfw']
handler.command = ['waifu', 'waifus']

export default handler
