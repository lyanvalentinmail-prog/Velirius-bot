import QRCode from 'qrcode'
import { apireonBuffer } from '../lib/apireon.js'

const MAX_TEXTO_QR = 2000

function textoVistaPrevia(text, max = 120) {
  const limpio = String(text || '').replace(/\s+/g, ' ').trim()
  if (limpio.length <= max) return limpio
  return `${limpio.slice(0, max)}...`
}

async function construirImagenQr(text) {
  try {
    const { buffer } = await apireonBuffer('/tools/qrcode', {
      text,
      size: 512
    })
    if (buffer?.length) return buffer
  } catch {}

  return QRCode.toBuffer(text, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 512,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const desdeArgs = (args.join(' ') || '').trim()
    const desdeCita = (m.quoted?.text || m.quoted?.caption || '').trim()
    const contenido = desdeArgs || desdeCita

    if (!contenido) {
      return conn.sendMessage(m.chat, {
        text: `*[❗] Escribí un texto o enlace (o respondé a un mensaje) con ${usedPrefix + command}*\n\n> *Ejemplo:* ${usedPrefix + command} https://apireon-36er.vercel.app`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    if (contenido.length > MAX_TEXTO_QR) {
      return conn.sendMessage(m.chat, {
        text: `*[❗] El contenido es muy largo.* Máximo ${MAX_TEXTO_QR} caracteres (tenés ${contenido.length}).`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const buferQr = await construirImagenQr(contenido)
    const leyenda = `*[✓] Código QR generado — Velirius bot*\n> ${textoVistaPrevia(contenido)}`

    await conn.sendMessage(m.chat, {
      image: buferQr,
      caption: leyenda,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('[qr] Error:', e)
    await conn.sendMessage(m.chat, {
      text: `*[❌] Error al generar el QR: ${e.message || 'desconocido'}*`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['#qr <texto/enlace> → genera un código QR']
handler.tags = ['herramientas']
handler.command = ['ge', 'qr', 'genqr', 'qrcode', 'generarqr']

export default handler
