import sharp from '../lib/sharp.js'
import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

function escaparXml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

async function estamparTextoEnImagen(buferImg, etiqueta) {
  try {
    const base = sharp(buferImg).rotate()
    const meta = await base.metadata()
    const ancho = meta.width || 600
    const alto = meta.height || 600
    const tamanoFuente = Math.max(24, Math.min(64, Math.round(ancho / Math.max(10, etiqueta.length * 0.65))))
    const y = Math.max(tamanoFuente + 16, alto - 28)

    const svg = Buffer.from(
      `<svg width="${ancho}" height="${alto}" xmlns="http://www.w3.org/2000/svg">
        <text x="${Math.round(ancho / 2)}" y="${y}"
          text-anchor="middle"
          font-family="Arial, Helvetica, sans-serif"
          font-weight="bold"
          font-size="${tamanoFuente}"
          fill="#FFFFFF"
          stroke="#000000"
          stroke-width="${Math.max(3, Math.round(tamanoFuente * 0.14))}"
          paint-order="stroke fill">${escaparXml(etiqueta.slice(0, 60))}</text>
      </svg>`
    )

    return await base.composite([{ input: svg, top: 0, left: 0 }]).jpeg({ quality: 90 }).toBuffer()
  } catch {
    return buferImg
  }
}

let handler = async (m, { conn, text }) => {
  const etiqueta = (text || '').trim()

  try {
    const { result, baseUrl } = await apireonJson('/search/pinterest', {
      query: 'funny cute cat reaction photo',
      limit: 25
    })
    const pines = Array.isArray(result?.pins) ? result.pins : []
    if (!pines.length) throw new Error('No se encontraron imágenes de gatos.')

    const elegido = pines[Math.floor(Math.random() * pines.length)]
    const urlImagen = apireonAbsUrl(elegido.image || elegido.thumbnail || '', baseUrl)
    const resp = await fetch(urlImagen)
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    let buferImagen = Buffer.from(await resp.arrayBuffer())

    if (etiqueta) {
      buferImagen = await estamparTextoEnImagen(buferImagen, etiqueta)
    }

    const leyenda = etiqueta
      ? `ִֶָ☾. 𝗖𝗮𝘁 ִֶָ☾.\n 𓍯  *Texto:* ${etiqueta}`
      : `ִֶָ☾. 𝗖𝗮𝘁 — 𝗩𝗲𝗹𝗶𝗿𝗶𝘂𝘀 𝗯𝗼𝘁 ִֶָ☾.`

    await conn.sendMessage(m.chat, {
      image: buferImagen,
      caption: leyenda,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  } catch (error) {
    console.error('Error en random-cat:', error)
    return conn.sendMessage(m.chat, {
      text: `[❌] No se pudo obtener la imagen del gato.\n\n> ${error.message || 'Intenta de nuevo.'}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['cat [texto] → Gato random (con texto opcional)']
handler.tags = ['random', 'imagenes']
handler.command = ['cat', 'gato', 'randomcat', 'catmeme']

export default handler
