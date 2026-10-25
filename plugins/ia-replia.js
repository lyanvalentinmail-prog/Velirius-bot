import { consultarIaApireon } from '../lib/delirius-ia.js'
import { bufferToDataUrl } from '../lib/apireon.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const objetivoImg = m.quoted && /image|webp/i.test((m.quoted.msg || m.quoted).mimetype || '')
    ? m.quoted
    : (/image|webp/i.test((m.msg || m).mimetype || '') ? m : null)

  if (!text?.trim() && !objetivoImg) {
    return conn.sendMessage(m.chat, {
      text: `*[❗] Debes ingresar un texto (o responder a una imagen) para consultar a Gemini / Replia.*\n*Ejemplo:* ${usedPrefix + command} Hola amigo`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  try {
    let imagenDataUrl = ''
    if (objetivoImg?.download) {
      try {
        const buf = await objetivoImg.download()
        const mime = (objetivoImg.msg || objetivoImg).mimetype || 'image/jpeg'
        if (buf?.length) imagenDataUrl = bufferToDataUrl(buf, mime.split(';')[0])
      } catch {}
    }

    const promptFinal = text?.trim() || 'Describe detalladamente esta imagen en español.'
    const respuestaApi = await consultarIaApireon(promptFinal, {
      systemPrompt: 'Eres Gemini / Replia en Velirius bot, una IA amigable y perspicaz. Responde natural y en el idioma del usuario.',
      preferido: 'gemini',
      image: imagenDataUrl,
      intentosPorProveedor: 2
    })

    if (!respuestaApi) {
      return conn.sendMessage(m.chat, {
        text: '*[❗] No se pudo obtener una respuesta de Gemini / Replia.*',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: respuestaApi,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en ia-replia:', e)
    return conn.sendMessage(m.chat, {
      text: `*[❌] Error al consultar la IA.*\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['#replia <texto>', '#gemini <texto o imagen>']
handler.tags = ['inteligencia']
handler.command = ['replia', 'ripleai', 'repli', 'repliai', 'gemini']

export default handler
