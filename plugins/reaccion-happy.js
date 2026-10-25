import { enviarReaccionApireon } from '../lib/apireon.js'

let handler = async (m, { conn, command }) => {
  const remitente = m.sender
  const mencion = [remitente]
  const etiquetaUsuario = '@' + String(remitente).split('@')[0]
  const endpoint = /blush|sonroj/i.test(command)
    ? 'blush'
    : /smile|sonreir/i.test(command)
      ? 'smile'
      : 'happy'

  const texto =
    endpoint === 'blush'
      ? `${etiquetaUsuario} se sonrojó 😳`
      : endpoint === 'smile'
        ? `${etiquetaUsuario} está sonriendo 😊`
        : `${etiquetaUsuario} está feliz 😄`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['alegre', 'happy', 'smile', 'blush']
handler.tags = ['diversion']
handler.command = ['alegre', 'happy', 'feliz', 'smile', 'sonreir', 'blush', 'sonrojarse']

export default handler
