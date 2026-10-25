import { apireonJson } from '../lib/apireon.js'
import { consultarIaApireon } from '../lib/delirius-ia.js'

const CODIGOS_IDIOMA = new Set([
  'es', 'en', 'pt', 'fr', 'de', 'it', 'ja', 'ko', 'zh', 'ru', 'ar', 'nl', 'tr', 'pl', 'hi'
])

function detectarIdiomaProbable(texto = '', destino = 'es') {
  if (/[ぁ-んァ-ン]/.test(texto)) return 'ja'
  if (/[가-힣]/.test(texto)) return 'ko'
  if (/[\u4e00-\u9fff]/.test(texto)) return 'zh'
  if (/[а-яА-ЯёЁ]/.test(texto)) return 'ru'
  if (/[\u0600-\u06FF]/.test(texto)) return 'ar'
  if (destino === 'es') return 'en'
  return 'es'
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    let idiomaDestino = 'es'
    let restoArgs = [...args]

    if (restoArgs[0] && CODIGOS_IDIOMA.has(restoArgs[0].toLowerCase())) {
      idiomaDestino = restoArgs.shift().toLowerCase()
    }

    const textoCitado = m.quoted?.text || m.quoted?.caption || ''
    const original = (restoArgs.join(' ').trim() || textoCitado.trim())

    if (!original) {
      return conn.sendMessage(m.chat, {
        text:
          `*[❗] Escribe un texto o responde a un mensaje para traducir.*\n\n` +
          `> *Ejemplos:*\n` +
          `> ${usedPrefix + command} Hello world\n` +
          `> ${usedPrefix + command} en Hola mundo\n` +
          `> (responde a un mensaje con *${usedPrefix + command}*)`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    let traduccion = ''
    const idiomaOrigen = detectarIdiomaProbable(original, idiomaDestino)

    if (idiomaOrigen !== idiomaDestino && original.length <= 480) {
      try {
        const { result } = await apireonJson('/tools/traductor', {
          text: original,
          from: idiomaOrigen,
          to: idiomaDestino
        })
        const candidato = String(
          result?.translatedText || result?.translation || result?.text || ''
        ).trim()
        if (
          candidato &&
          !/PLEASE SELECT TWO DISTINCT LANGUAGES|MYMEMORY WARNING/i.test(candidato)
        ) {
          traduccion = candidato
        }
      } catch {}
    }

    if (!traduccion) {
      const prompt = `Traduce al idioma "${idiomaDestino}" el siguiente texto. Responde ÚNICAMENTE con el texto traducido, sin comillas ni explicaciones:\n\n${original}`
      traduccion = await consultarIaApireon(prompt, {
        systemPrompt: 'Eres un traductor profesional. Devuelve únicamente la traducción exacta solicitada.',
        preferido: 'chatgpt',
        intentosPorProveedor: 2
      })
    }

    if (!traduccion) {
      return conn.sendMessage(m.chat, {
        text: '*[❗] No se pudo obtener respuesta de la API de traducción.*',
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      text: traduccion.trim(),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (e) {
    console.error('Error en comando traducir:', e)
    return conn.sendMessage(m.chat, {
      text: '*[❗] Ocurrió un error al traducir el mensaje.*',
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['traduc [idioma] <texto o respuesta>']
handler.tags = ['inteligencia', 'herramientas']
handler.command = ['traduc', 'traducir', 'tr']

export default handler
