import { apireonJson } from '../lib/apireon.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `ִֶָ☾. Ingresa un usuario o tema para buscar en *Instagram*.\n\n> *Ejemplo:* ${usedPrefix + command} nasa`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const consulta = text.trim().replace(/^@/, '')
  await m.react('⏳').catch(() => {})

  try {
    const { result } = await apireonJson('/search/instagram', { query: consulta, limit: 8 })
    const resultados = Array.isArray(result?.results) ? result.results : []
    const perfilDirecto = result?.directProfileUrl || `https://www.instagram.com/${encodeURIComponent(consulta)}/`

    if (!resultados.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron resultados en Instagram para *${consulta}*.\n> Perfil directo: ${perfilDirecto}`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    let cuerpo = `ִֶָ☾. *Instagram Search* ִֶָ☾.\n`
    cuerpo += `> *Búsqueda:* ${consulta}\n`
    cuerpo += `> *Perfil sugerido:* ${perfilDirecto}\n\n`

    resultados.slice(0, 7).forEach((it, idx) => {
      cuerpo += `*${idx + 1}.* ${it.title || it.username || 'Instagram'}\n`
      if (it.username) cuerpo += `> *Usuario:* @${it.username}\n`
      if (it.description) cuerpo += `> ${String(it.description).trim().slice(0, 180)}\n`
      if (it.url) cuerpo += `> ${it.url}\n`
      cuerpo += '\n'
    })

    await conn.sendMessage(m.chat, {
      text: cuerpo.trim(),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[igsearch] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error buscando en Instagram.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['igsearch <búsqueda>', 'igs <búsqueda>']
handler.tags = ['buscador']
handler.command = ['igsearch', 'instagramsearch', 'igs', 'igbuscar']
handler.group = true

export default handler
