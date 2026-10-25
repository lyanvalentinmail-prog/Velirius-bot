import { enviarReaccionApireon } from '../lib/apireon.js'

let handler = async (m, { conn, command }) => {
  const remitente = m.sender
  const mencion = [remitente]
  const etiquetaUsuario = '@' + String(remitente).split('@')[0]
  const endpoint = /smug|presum/i.test(command) ? 'smug' : 'laugh'
  const texto =
    endpoint === 'smug'
      ? `${etiquetaUsuario} puso cara presumida 😏`
      : `${etiquetaUsuario} se está riendo 😂`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['reir', 'risa', 'smug']
handler.tags = ['diversion']
handler.command = ['reir', 'risa', 'laugh', 'smug', 'presumir']

export default handler
