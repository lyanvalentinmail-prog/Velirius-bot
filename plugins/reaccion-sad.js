import { enviarReaccionApireon } from '../lib/apireon.js'

let handler = async (m, { conn, command }) => {
  const remitente = m.sender
  const mencion = [remitente]
  const etiquetaUsuario = '@' + String(remitente).split('@')[0]
  const endpoint = /sleep|dormir/i.test(command) ? 'sleep' : 'cry'
  const texto =
    endpoint === 'sleep'
      ? `${etiquetaUsuario} se quedó dormido 😴`
      : `${etiquetaUsuario} se puso triste 😢`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['triste', 'sad', 'sleep']
handler.tags = ['diversion']
handler.command = ['triste', 'sad', 'cry', 'llorar', 'sleep', 'dormir']

export default handler
