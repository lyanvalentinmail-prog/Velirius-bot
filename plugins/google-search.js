import { apireonJson } from '../lib/apireon.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `ִֶָ☾. Ingresa lo que deseas buscar en la web.\n\n> *Ejemplo:* ${usedPrefix + command} historia de Uruguay`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const consulta = text.trim()
  await m.react('⏳').catch(() => {})

  try {
    const { result } = await apireonJson('/search/google', { query: consulta, limit: 8 })
    const resultados = Array.isArray(result?.results) ? result.results : []

    if (!resultados.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron resultados web para *${consulta}*.`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    let cuerpo = `ִֶָ☾. *Búsqueda Web — Velirius bot* ִֶָ☾.\n`
    cuerpo += `> *Consulta:* ${consulta}\n\n`

    resultados.slice(0, 7).forEach((r, idx) => {
      cuerpo += `*${idx + 1}. ${r.title || 'Resultado'}*\n`
      if (r.description || r.snippet) {
        cuerpo += `> ${String(r.description || r.snippet).trim().slice(0, 220)}\n`
      }
      if (r.url) cuerpo += `🔗 ${r.url}\n`
      cuerpo += '\n'
    })

    await conn.sendMessage(m.chat, {
      text: cuerpo.trim(),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[google-search] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error al buscar en la web.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['google <búsqueda>', 'buscar <búsqueda>']
handler.tags = ['buscador']
handler.command = ['google', 'buscar', 'g', 'search']

export default handler
