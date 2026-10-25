import { sanitizeTikTokUrl, downloadTikTok, searchTikTok } from './tiktok-2.js'

const REGEX_URL_TT = /https?:\/\/(?:www\.|vm\.|vt\.|m\.)?tiktok\.com\/[^\s]+/i

function formatearNumero(n) {
  const num = Number(n)
  if (!Number.isFinite(num)) return String(n || 0)
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}

function construirLeyendaBusqueda(item) {
  const titulo = String(item?.title || 'Sin descripción').trim().slice(0, 260)
  const autor = item?.author?.nickname || item?.author?.username || 'TikTok'
  const usuario = item?.author?.username ? ` (@${item.author.username})` : ''
  const estadisticas = item?.stats || {}
  const metricas = [
    estadisticas.views ? `▶ ${formatearNumero(estadisticas.views)}` : '',
    estadisticas.likes ? `❤️ ${formatearNumero(estadisticas.likes)}` : '',
    estadisticas.comments ? `💬 ${formatearNumero(estadisticas.comments)}` : ''
  ].filter(Boolean).join(' · ')

  return (
    `🎵 *TikTok Search*\n\n` +
    `👤 *Autor:* ${autor}${usuario}\n` +
    (metricas ? `📊 ${metricas}\n` : '') +
    `📝 ${titulo}`
  )
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const textoCitado = m.quoted?.text || m.quoted?.caption || ''
  const crudo = (text || textoCitado || '').trim()

  if (!crudo) {
    return conn.sendMessage(m.chat, {
      text:
        `[❗] Escribe un *enlace* o una *búsqueda* de TikTok.\n\n` +
        `> *Enlace:* ${usedPrefix + command} https://vm.tiktok.com/...\n` +
        `> *Buscar:* ${usedPrefix + command} edits anime`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const coincidenciaUrl = crudo.match(REGEX_URL_TT)
  await m.react('⏳').catch(() => {})

  try {
    if (coincidenciaUrl) {
      const urlLimpia = sanitizeTikTokUrl(coincidenciaUrl[0])
      const d = await downloadTikTok(urlLimpia, 'video')

      await conn.sendMessage(m.chat, {
        video: d.buffer,
        mimetype: 'video/mp4',
        caption: `🎵 *TikTok Downloader*\n\n👤 *Autor:* ${d.author || 'TikTok'}\n📝 ${String(d.title || 'TikTok').slice(0, 260)}`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })

      await m.react('✅').catch(() => {})
      return
    }

    const resultados = await searchTikTok(crudo, 8)
    const conUrl = resultados.filter(r => r.url)
    const elegido = conUrl[Math.floor(Math.random() * Math.min(conUrl.length, 4))] || resultados[0]
    if (!elegido?.url) throw new Error('No se encontró un enlace válido.')

    const d = await downloadTikTok(elegido.url, 'video')
    await conn.sendMessage(m.chat, {
      video: d.buffer,
      mimetype: 'video/mp4',
      caption: construirLeyendaBusqueda(elegido),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[tiktok2] Error:', e.message)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error con TikTok.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['tiktok2 <url|búsqueda>', 'tt2 <url|búsqueda>']
handler.tags = ['descargas']
handler.command = ['tiktok2', 'tt2', 'tiktoks2', 'tts2']
handler.group = true

export default handler
