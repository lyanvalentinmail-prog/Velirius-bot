import { enviarReaccionApireon } from '../lib/apireon.js'

let handler = async (m, { conn, command }) => {
  const remitente = m.sender
  const mencion = [remitente]
  const etiquetaUsuario = '@' + String(remitente).split('@')[0]
  const endpoint = /pout|puchero/i.test(command) ? 'pout' : 'angry'
  const texto =
    endpoint === 'pout'
      ? `${etiquetaUsuario} está haciendo puchero 😤`
      : `${etiquetaUsuario} se está enojando 😠`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['angry', 'enojado', 'pout']
handler.tags = ['diversion']
handler.command = ['angry', 'enojado', 'pout', 'puchero']

export default handler
