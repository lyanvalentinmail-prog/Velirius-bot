import { consultarIaApireon, formatearPensamiento } from '../lib/delirius-ia.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `*[❗] Debes escribir un mensaje para la IA.*\n*Ejemplo:* ${usedPrefix + command} Explícame la computación cuántica`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const cmd = String(command || '').toLowerCase()
  const modelo =
    cmd === 'deepseek'
      ? 'deepseek'
      : cmd === 'grok'
        ? 'grok'
        : 'claude'

  const etiqueta =
    modelo === 'deepseek'
      ? 'DeepSeek'
      : modelo === 'grok'
        ? 'Grok'
        : cmd.includes('kora')
          ? 'Kora (Claude)'
          : 'Claude'

  try {
    const respuestaApi = await consultarIaApireon(text.trim(), {
      systemPrompt: `Eres ${etiqueta} en Velirius bot. Responde de forma clara, natural y útil en el idioma del usuario.`,
      preferido: modelo,
      intentosPorProveedor: 2
    })

    if (!respuestaApi) {
      return conn.sendMessage(m.chat, {
        text: `*[❗] ${etiqueta} no devolvió una respuesta.*`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: formatearPensamiento(respuestaApi),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en ia-kora:', e)
    await conn.sendMessage(m.chat, {
      text: `*[❌] Error al consultar a ${etiqueta}.*\n> ${e.message || 'Intenta más tarde.'}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['#kora <texto>', '#claude <texto>', '#deepseek <texto>', '#grok <texto>']
handler.tags = ['inteligencia']
handler.command = ['kora', 'ia-kora', 'korai', 'claude', 'deepseek', 'grok']

export default handler
