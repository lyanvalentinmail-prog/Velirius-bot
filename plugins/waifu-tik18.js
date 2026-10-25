import { apireonBuffer, apireonJson } from '../lib/apireon.js'

const CONSULTAS = [
  'cosplay anime transition',
  'aesthetic dance trend',
  'kpop dance cover'
]

let handler = async (m, { conn }) => {
  try {
    await m.react('⏳').catch(() => {})
    const q = CONSULTAS[Math.floor(Math.random() * CONSULTAS.length)]
    const { result } = await apireonJson('/search/tiktok', { query: q, limit: 12 })
    const videos = (Array.isArray(result?.videos) ? result.videos : []).filter(v => v?.url)

    if (!videos.length) {
      await m.react('❌').catch(() => {})
      return m.reply('*[❗] No se pudo obtener el video. Intenta de nuevo más tarde.*')
    }

    const elegido = videos[Math.floor(Math.random() * videos.length)]
    const { buffer } = await apireonBuffer('/downloader/tiktok', { url: elegido.url, type: 'video' })

    await conn.sendMessage(
      m.chat,
      {
        video: buffer,
        mimetype: 'video/mp4',
        fileName: 'tik18.mp4',
        mentions: [m.sender],
        contextInfo: { ...rcanal?.contextInfo }
      },
      { quoted: m }
    )

    await m.react('✅').catch(() => {})
  } catch (error) {
    console.error('Error en comando tik18:', error)
    await m.react('❌').catch(() => {})
    m.reply('*[❗] Ocurrió un error al obtener el video. Inténtalo de nuevo más tarde.*')
  }
}

handler.help = ['#tik18', '#tk18', '#tk']
handler.tags = ['nsfw']
handler.command = ['tik18', 'tk18', 'tk']

export default handler
