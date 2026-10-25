import { apireonBuffer, bufferToDataUrl } from '../lib/apireon.js'

const ESTILOS_VALIDOS = ['anime', 'vivid', 'cyberpunk', 'pixel', 'noir', 'sketch']

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const objetivoImg = m.quoted && /image|webp/i.test((m.quoted.msg || m.quoted).mimetype || '')
    ? m.quoted
    : (/image|webp/i.test((m.msg || m).mimetype || '') ? m : null)

  if (!text?.trim() && !objetivoImg) {
    return conn.sendMessage(m.chat, {
      text: `*[❗] Uso:* ${usedPrefix + command} <prompt>\n*Estilos opcionales:* anime | vivid | cyberpunk | pixel | noir | sketch\n\n*Ejemplo:* ${usedPrefix + command} un gato astronauta cyberpunk`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  let entrada = (text || '').trim()
  let estilo = /animg|animagine|anime/i.test(command) ? 'anime' : 'vivid'

  const matchEstilo = entrada.match(/^--(anime|vivid|cyberpunk|pixel|noir|sketch)\s+(.+)$/i)
  if (matchEstilo && ESTILOS_VALIDOS.includes(matchEstilo[1].toLowerCase())) {
    estilo = matchEstilo[1].toLowerCase()
    entrada = matchEstilo[2].trim()
  }

  const promptFinal = entrada || 'Transform this image into vibrant anime illustration'

  await m.react('🎨').catch(() => {})
  await conn.sendMessage(m.chat, {
    text: `🎨 *Generando imagen con Velirius AI...*\n\n> *Prompt:* ${promptFinal}\n> *Estilo:* ${estilo}`,
    contextInfo: { ...rcanal?.contextInfo }
  }, { quoted: m })

  try {
    let imageDataUrl = ''
    if (objetivoImg?.download) {
      try {
        const buf = await objetivoImg.download()
        const mime = (objetivoImg.msg || objetivoImg).mimetype || 'image/jpeg'
        if (buf?.length) imageDataUrl = bufferToDataUrl(buf, mime.split(';')[0])
      } catch {}
    }

    const { buffer } = await apireonBuffer(
      '/ai/nano-banana',
      {
        prompt: promptFinal,
        style: estilo,
        ...(imageDataUrl ? { image: imageDataUrl } : {})
      },
      {
        method: imageDataUrl ? 'POST' : 'GET',
        timeoutMs: 90000
      }
    )

    const leyenda =
      `ִֶָ☾. *Velirius AI Studio* ִֶָ☾.\n\n` +
      `𓍯 *Prompt:* ${promptFinal}\n` +
      `𓍯 *Modelo:* Nano-Banana\n` +
      `𓍯 *Estilo:* ${estilo}`

    await conn.sendMessage(
      m.chat,
      { image: buffer, caption: leyenda, contextInfo: { ...rcanal?.contextInfo } },
      { quoted: m }
    )
    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('Error en ia-anime:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(
      m.chat,
      { text: `*[❗] Error generando imagen:* ${e.message}`, contextInfo: { ...rcanal?.contextInfo } },
      { quoted: m }
    )
  }
}

handler.help = ['animg <prompt>', 'imagine <prompt>']
handler.tags = ['ia', 'imagenes']
handler.command = ['animg', 'animagine', 'ia-anime', 'nanobanana', 'imagine', 'iaimg']

export default handler
