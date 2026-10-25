import { consultarIaApireon } from '../lib/delirius-ia.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `*[❗] Debes ingresar un texto para consultar a Copilot.*\n*Ejemplo:* ${usedPrefix + command} Hola, ¿quién eres tú?`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  try {
    const respuestaApi = await consultarIaApireon(text.trim(), {
      systemPrompt: 'Eres Copilot integrado en Velirius bot. Responde claro y útil en el idioma del usuario.',
      preferido: 'copilot',
      intentosPorProveedor: 2
    })

    if (!respuestaApi) {
      return conn.sendMessage(m.chat, {
        text: '*[❗] No se pudo obtener una respuesta de Copilot.*',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: respuestaApi,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en ia-copilot:', e)
    return conn.sendMessage(m.chat, {
      text: `*[❌] Error al consultar a Copilot.*\n\n> ${e.message || 'Intenta de nuevo más tarde.'}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['#copilot <texto> → Chat con Copilot IA']
handler.tags = ['inteligencia']
handler.command = ['copilot', 'copi', 'msft', 'bing']

export default handler
