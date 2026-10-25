import { enviarReaccionApireon } from '../lib/apireon.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  const objetivo = m.mentionedJid?.[0] || m.quoted?.sender || null
  if (!objetivo) {
    return conn.sendMessage(m.chat, {
      text: `[❗] Debes mencionar o responder a un usuario.\n\n> Ejemplo: ${usedPrefix + command} @usuario`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const remitente = m.sender
  const mencion = [remitente, objetivo]
  const etiquetaUsuario = '@' + String(remitente).split('@')[0]
  const etiquetaObjetivo = '@' + String(objetivo).split('@')[0]
  const endpoint = /cuddle|acurrucar/i.test(command) ? 'cuddle' : /pat|acariciar/i.test(command) ? 'pat' : 'hug'
  const accionTexto =
    endpoint === 'cuddle'
      ? `se acurrucó con ${etiquetaObjetivo} 🥰`
      : endpoint === 'pat'
        ? `acarició suavemente a ${etiquetaObjetivo} ✨`
        : `le dio un fuerte abrazo a ${etiquetaObjetivo} 🫂`

  try {
    await enviarReaccionApireon(m, conn, {
      endpoint,
      texto: `${etiquetaUsuario} ${accionTexto}`,
      mencion
    })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['abrazo @user', 'pat @user', 'cuddle @user']
handler.tags = ['reaccion']
handler.command = ['hug', 'abrazo', 'pat', 'acariciar', 'cuddle', 'acurrucar']

export default handler
