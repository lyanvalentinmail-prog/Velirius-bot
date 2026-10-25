import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

let handler = async (m, { conn, text }) => {
  try {
    if (text?.trim()) {
      const { result, baseUrl } = await apireonJson('/anime/character', { query: text.trim() })
      const personaje = Array.isArray(result?.characters) ? result.characters[0] : (result?.character || result)
      const img = apireonAbsUrl(personaje?.image || personaje?.images?.jpg?.image_url || '', baseUrl)
      if (img) {
        const nombre = personaje?.name || text.trim()
        const anime = personaje?.anime || ''
        const leyenda =
          `ִֶָ☾. *Personaje Anime*\n\n` +
          `𓍯 *Nombre:* ${nombre}` +
          (anime ? `\n𓍯 *Anime:* ${anime}` : '')
        await conn.sendMessage(
          m.chat,
          { image: { url: img }, caption: leyenda, mentions: [m.sender], contextInfo: { ...rcanal?.contextInfo } },
          { quoted: m }
        )
        return
      }
    }

    const { buffer } = await apireonBuffer('/anime/neko')
    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: `ִֶָ☾. *Waifu / Neko — Velirius bot*`,
        mentions: [m.sender],
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )
  } catch (error) {
    console.error('Error en comando waifu2:', error)
    m.reply('*[❗] Ocurrió un error al obtener la imagen. Inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#waifu2', '#waifu2 <personaje>']
handler.tags = ['anime', 'nsfw']
handler.command = ['waifu2', 'waifus2']

export default handler
