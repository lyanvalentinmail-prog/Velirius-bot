import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const LIMITE_RESULTADOS = 4

function recortarTexto(text = '', max = 120) {
  const valor = String(text).replace(/\s+/g, ' ').trim()
  if (!valor || valor === '-') return ''
  return valor.length > max ? `${valor.slice(0, max - 1)}…` : valor
}

function construirLeyenda(elemento, indice, total, consulta) {
  return `ִֶָ☾. 𝗪𝗮𝗹𝗹𝗽𝗮𝗽𝗲𝗿 ִֶָ☾. *${indice + 1}/${total}*

 𓍯  *Búsqueda:* ${consulta}
 𓍯  *Título:* ${recortarTexto(elemento.title, 120) || 'Wallpaper HD'}
 𓍯  *Autor:* ${recortarTexto(elemento.author, 50) || 'Velirius Gallery'}
 𓍯  *Resolución:* ${elemento.width && elemento.height ? `${elemento.width}x${elemento.height}` : 'HD'}`
}

async function enviarWallpaper(conn, chat, urlDescarga, leyenda, quoted) {
  try {
    await conn.sendMessage(chat, {
      image: { url: urlDescarga },
      caption: leyenda,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted })
    return true
  } catch {
    const respuesta = await fetch(urlDescarga)
    if (!respuesta.ok) throw new Error('No se pudo descargar la imagen.')
    const bufer = Buffer.from(await respuesta.arrayBuffer())
    await conn.sendMessage(chat, {
      image: bufer,
      caption: leyenda,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted })
    return true
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. Ingresa qué wallpaper buscar.\n\n> *Ejemplo:*\n${usedPrefix + command} cyberpunk city`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const consulta = text.trim()
    await m.react('⏳').catch(() => {})

    const { result, baseUrl } = await apireonJson('/search/pinterest', {
      query: `${consulta} wallpaper hd`,
      limit: 12
    })

    const pines = Array.isArray(result?.pins) ? result.pins : []
    const resultados = pines
      .map(p => ({
        ...p,
        download: apireonAbsUrl(p.image || p.thumbnail || '', baseUrl)
      }))
      .filter(p => p.download)
      .slice(0, LIMITE_RESULTADOS)

    if (!resultados.length) {
      throw '[❗] No se encontraron wallpapers para esa búsqueda.'
    }

    for (let i = 0; i < resultados.length; i++) {
      const elemento = resultados[i]
      const leyenda = construirLeyenda(elemento, i, resultados.length, consulta)
      try {
        await enviarWallpaper(conn, m.chat, elemento.download, leyenda, m)
      } catch (err) {
        console.error(`Error enviando wall ${i + 1}:`, err)
      }
    }

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('Error en wallpaper:', e)
    await m.react('❌').catch(() => {})
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string' ? e : `[❗] Error al buscar wallpapers.\n\n${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['wall <búsqueda> → 4 wallpapers con descripción']
handler.tags = ['descargas', 'imagenes']
handler.command = ['wall', 'wallcraft', 'wallpaper', 'wallpapers', 'fondo']

export default handler
