import { enviarReaccionApireon } from '../lib/apireon.js'

let handler = async (m, { conn, command }) => {
  const remitente = m.sender
  const mencion = [remitente]
  const etiquetaUsuario = '@' + String(remitente).split('@')[0]
  const endpoint = /wave|saludar/i.test(command) ? 'wave' : /wink|guino/i.test(command) ? 'wink' : 'dance'
  const texto =
    endpoint === 'wave'
      ? `${etiquetaUsuario} está saludando 👋`
      : endpoint === 'wink'
        ? `${etiquetaUsuario} lanzó un guiño 😉`
        : `${etiquetaUsuario} está bailando 🎶`

  try {
    await enviarReaccionApireon(m, conn, { endpoint, texto, mencion })
  } catch (e) {
    await conn.sendMessage(m.chat, {
      text: `[❌] No se pudo enviar la reacción.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['dance', 'danzar', 'wave', 'wink']
handler.tags = ['diversion']
handler.command = ['dance', 'danzar', 'wave', 'saludar', 'wink', 'guino']

export default handler
