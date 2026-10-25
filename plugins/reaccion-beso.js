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
  const endpoint = /handhold|mano/i.test(command) ? 'handhold' : 'kiss'
  const texto =
    endpoint === 'handhold'
      ? `${etiquetaUsuario} tomó de la mano a ${etiquetaObjetivo} 💞`
      : `${etiquetaUsuario} le dio un beso a ${etiquetaObjetivo} ❤`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['kiss @user', 'handhold @user']
handler.tags = ['reaccion']
handler.command = ['kiss', 'beso', 'handhold', 'tomarmano']

export default handler
