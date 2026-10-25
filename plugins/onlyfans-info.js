import { apireonJson } from '../lib/apireon.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `[❗] Uso incorrecto\n\n> *Ejemplo:*\n ${usedPrefix + command} usuario`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const nombreUsuario = text.trim().replace(/^@/, '').toLowerCase()

  try {
    await m.react('⏳').catch(() => {})
    const { result } = await apireonJson('/search/google', {
      query: `site:onlyfans.com "${nombreUsuario}"`,
      limit: 6
    })

    const resultados = Array.isArray(result?.results) ? result.results : []
    const enlacePerfil = `https://onlyfans.com/${encodeURIComponent(nombreUsuario)}`

    if (!resultados.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron referencias públicas para *@${nombreUsuario}*.\n> *Perfil directo:* ${enlacePerfil}`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const principal = resultados[0]
    let cuerpo =
      `ִֶָ☾. *OnlyFans Search — Velirius bot* ִֶָ☾.\n\n` +
      `> *Usuario:* @${nombreUsuario}\n` +
      `> *Título:* ${principal.title || nombreUsuario}\n` +
      `> *Perfil:* ${principal.url || enlacePerfil}\n\n`

    if (principal.description || principal.snippet) {
      cuerpo += `> *Descripción:*\n> ${String(principal.description || principal.snippet).trim().slice(0, 260)}\n\n`
    }

    if (resultados.length > 1) {
      cuerpo += `> *Coincidencias adicionales:*\n`
      resultados.slice(1, 5).forEach((r, idx) => {
        cuerpo += `*${idx + 2}.* ${r.title || 'Resultado'}\n> ${r.url || ''}\n`
      })
    }

    await conn.sendMessage(m.chat, {
      text: cuerpo.trim(),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
    await m.react('✅').catch(() => {})
  } catch (error) {
    console.error('Error en comando onlyfans-info:', error)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error al buscar información: ${error.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['onlyfans <username>', 'of <username>', 'onlyfansinfo <username>']
handler.tags = ['búsquedas']
handler.command = ['onlyfans', 'of', 'onlyfansinfo']

export default handler
