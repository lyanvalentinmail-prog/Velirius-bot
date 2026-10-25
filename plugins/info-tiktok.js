import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

function formatearNumero(num) {
  const n = Number(num) || 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    if (!args[0]) {
      return conn.sendMessage(m.chat, {
        text: `[❗] Uso incorrecto\n\n> *Ejemplo:* ${usedPrefix}${command} khaby.lame`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const nombreUsuario = args[0].trim().replace(/^@/, '')
    if (!nombreUsuario) {
      return conn.sendMessage(m.chat, {
        text: '[❗] Username inválido.',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await m.react('⏳').catch(() => {})

    const { result, baseUrl } = await apireonJson('/search/tiktok', {
      query: `@${nombreUsuario}`,
      limit: 10
    })

    const videos = Array.isArray(result?.videos) ? result.videos : []
    if (!videos.length) {
      throw new Error('No se encontraron videos públicos para ese usuario en TikTok.')
    }

    const coincidenciaExacta = videos.filter(
      v => String(v?.author?.username || '').toLowerCase() === nombreUsuario.toLowerCase()
    )
    const muestra = coincidenciaExacta.length ? coincidenciaExacta : videos
    const autor = muestra[0]?.author || {}
    const avatar = apireonAbsUrl(autor.avatar || muestra[0]?.cover || '', baseUrl)

    const totalVistas = muestra.reduce((acc, v) => acc + (Number(v?.stats?.views) || 0), 0)
    const totalLikes = muestra.reduce((acc, v) => acc + (Number(v?.stats?.likes) || 0), 0)
    const totalComentarios = muestra.reduce((acc, v) => acc + (Number(v?.stats?.comments) || 0), 0)
    const videoDestacado = muestra[0]

    const textoInfo =
      `🌴 *TIKTOK PROFILE — VELIRIUS BOT* 🌴\n\n` +
      `> *Nombre:* ${autor.nickname || nombreUsuario}\n` +
      `> *Usuario:* @${autor.username || nombreUsuario}\n` +
      `> *Perfil:* https://www.tiktok.com/@${encodeURIComponent(autor.username || nombreUsuario)}\n` +
      `> *Videos analizados:* ${muestra.length}\n` +
      `> *Vistas recientes:* ${formatearNumero(totalVistas)}\n` +
      `> *Likes recientes:* ${formatearNumero(totalLikes)}\n` +
      `> *Comentarios recientes:* ${formatearNumero(totalComentarios)}\n` +
      (videoDestacado?.title ? `> *Último / Destacado:* ${String(videoDestacado.title).slice(0, 140)}\n` : '') +
      (videoDestacado?.url ? `> *Video:* ${videoDestacado.url}` : '')

    if (avatar) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: avatar },
          caption: textoInfo.trim(),
          contextInfo: {
            ...rcanal?.contextInfo,
            mentionedJid: [m.sender]
          }
        }, { quoted: m })
        await m.react('✅').catch(() => {})
        return
      } catch {}
    }

    await conn.sendMessage(m.chat, {
      text: textoInfo.trim(),
      contextInfo: {
        ...rcanal?.contextInfo,
        mentionedJid: [m.sender]
      }
    }, { quoted: m })
    await m.react('✅').catch(() => {})
  } catch (error) {
    console.error('Error en tik:', error)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error: ${error.message || 'No se pudo obtener la información del perfil'}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['tik <usuario> → Obtiene información de un perfil de TikTok']
handler.tags = ['herramientas', 'osint']
handler.command = ['tik', 'tiktokstalk', 'ttstalk', 'infotiktok']

export default handler
