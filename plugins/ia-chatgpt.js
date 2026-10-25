import { consultarIaApireon, formatearPensamiento } from '../lib/delirius-ia.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const citado = m.quoted?.text || m.quoted?.caption || ''
  const consulta = text?.trim()
    ? (citado ? `${text.trim()}\n\nContexto citado:\n${citado}` : text.trim())
    : ''

  if (!consulta) {
    return conn.sendMessage(m.chat, {
      text: `*[❗] Debes ingresar un texto para consultar a ChatGPT.*\n*Ejemplo:* ${usedPrefix + command} ¿Quién eres?`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  try {
    const respuestaApi = await consultarIaApireon(consulta, {
      systemPrompt: 'Eres Velirius bot, un asistente inteligente, útil y directo en WhatsApp. Responde en el idioma del usuario.',
      preferido: 'chatgpt',
      intentosPorProveedor: 2
    })

    if (!respuestaApi) {
      return conn.sendMessage(m.chat, {
        text: '*[❗] No se pudo obtener una respuesta de la IA.*',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: formatearPensamiento(respuestaApi),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en comando chatgpt:', e)
    await conn.sendMessage(m.chat, {
      text: '*[❗] Ocurrió un error al procesar tu consulta. Inténtalo de nuevo más tarde.*',
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['#chatgpt <texto>']
handler.tags = ['inteligencia']
handler.command = ['gpt', 'chatgpt', 'ia']

export default handler
