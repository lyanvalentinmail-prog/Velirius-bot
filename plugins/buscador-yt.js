import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

function formatearVistas(n) {
  if (typeof n === 'string' && /[KMB]/i.test(n)) return n
  const v = Number(n) || 0
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K`
  return String(v || '—')
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. Ingresa lo que deseas buscar en YouTube.\n\n> *Ejemplo:*\n${usedPrefix + command} its you`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const { result, baseUrl } = await apireonJson('/search/youtube', { query: text.trim(), limit: 5 })
    const lista = Array.isArray(result?.videos) ? result.videos : []

    if (!lista.length) {
      throw '[❗] No se encontraron resultados.'
    }

    const resultados = lista.slice(0, 5).map(v => ({
      title: v.title || 'Sin título',
      url: v.url || (v.videoId ? `https://youtu.be/${v.videoId}` : ''),
      duration: v.duration || '—',
      views: v.views || 0,
      published: v.published || '',
      author: v.channel?.name || v.authorName || v.author || 'YouTube',
      image: apireonAbsUrl(v.thumbnail || v.image || '', baseUrl)
    }))

    global.lastYtSearch = global.lastYtSearch || {}
    global.lastYtSearch[m.sender] = { results: resultados, at: Date.now() }

    let cuerpo = `ִֶָ☾. 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗦𝗲𝗮𝗿𝗰𝗵 ִֶָ☾.\n`
    cuerpo += `> *Búsqueda:* ${text.trim()}\n\n`

    resultados.forEach((v, i) => {
      cuerpo += `*${i + 1}.* ${v.title}\n`
      cuerpo += ` 𓍯 *Canal:* ${v.author}\n`
      cuerpo += ` 𓍯 *Duración:* ${v.duration} · *Vistas:* ${formatearVistas(v.views)}\n`
      if (v.published) cuerpo += ` 𓍯 *Subido:* ${v.published}\n`
      cuerpo += ` 𓍯 *Link:* ${v.url}\n\n`
    })

    cuerpo += `_Para descargar uno usa:_\n`
    cuerpo += `> *${usedPrefix}video <número>*  o  *${usedPrefix}play <número>*`

    const urlMiniatura = resultados[0]?.image
    if (urlMiniatura && /^https?:\/\//i.test(urlMiniatura)) {
      try {
        const miniatura = (await conn.getFile(urlMiniatura)).data
        return await conn.sendMessage(
          m.chat,
          { image: miniatura, caption: cuerpo, contextInfo: { ...rcanal?.contextInfo } },
          { quoted: m }
        )
      } catch {}
    }

    await conn.sendMessage(
      m.chat,
      { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } },
      { quoted: m }
    )
  } catch (e) {
    console.error('Error en buscador-yt:', e)
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string'
        ? e
        : `[❌] Error en la búsqueda.\n\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['yt <búsqueda>', 'yts <búsqueda>']
handler.command = ['yt', 'yts', 'ytsearch']
handler.tags = ['buscador']
handler.group = true

export default handler
