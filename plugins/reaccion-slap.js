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

  const endpoint = /punch|golpe/i.test(command)
    ? 'punch'
    : /bite|morder/i.test(command)
      ? 'bite'
      : /poke|picar/i.test(command)
        ? 'poke'
        : 'slap'

  const texto =
    endpoint === 'punch'
      ? `${etiquetaUsuario} le dio un puñetazo a ${etiquetaObjetivo} 💥`
      : endpoint === 'bite'
        ? `${etiquetaUsuario} mordió a ${etiquetaObjetivo} 🦷`
        : endpoint === 'poke'
          ? `${etiquetaUsuario} molestó a ${etiquetaObjetivo} 👉`
          : `${etiquetaUsuario} le dio una bofetada fuerte a ${etiquetaObjetivo} 👊`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['slap @user', 'punch @user', 'bite @user', 'poke @user']
handler.tags = ['reaccion']
handler.command = ['bang', 'bofetada', 'slap', 'punch', 'golpear', 'bite', 'morder', 'poke', 'picar']

export default handler
