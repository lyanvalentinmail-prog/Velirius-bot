import { apireonJson } from '../lib/apireon.js'

const MAX_FRAGMENTO = 3800

function partirLetras(text, max = MAX_FRAGMENTO) {
  const fragmentos = []
  let resto = String(text || '').trim()
  if (!resto) return fragmentos

  while (resto.length > max) {
    let corte = resto.lastIndexOf('\n', max)
    if (corte < max * 0.4) corte = max
    fragmentos.push(resto.slice(0, corte).trim())
    resto = resto.slice(corte).trim()
  }

  if (resto) fragmentos.push(resto)
  return fragmentos
}

function formatearDuracionSeg(seg) {
  const s = Math.floor(Number(seg) || 0)
  if (!s) return '—'
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function construirEncabezado(datos, consulta) {
  return `ִֶָ☾. 𝗟𝘆𝗿𝗶𝗰𝘀 ִֶָ☾.

 𓍯  *Búsqueda:* ${consulta}
 𓍯  *Título:* ${datos.trackName || datos.title || 'Desconocido'}
 𓍯  *Artista:* ${datos.artistName || datos.artists || 'Desconocido'}
 𓍯  *Álbum:* ${datos.albumName || datos.album || '—'}
 𓍯  *Duración:* ${datos.durationSeconds ? formatearDuracionSeg(datos.durationSeconds) : (datos.duration || '—')}`
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. Ingresa el nombre de la canción.\n\n> *Ejemplo:*\n${usedPrefix + command} Blinding Lights`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const consulta = text.trim()
    let datos = null

    try {
      const { result } = await apireonJson('/search/lyric', { query: consulta })
      datos = result
    } catch {
      const { result } = await apireonJson('/downloader/lyric', { query: consulta })
      datos = result
    }

    const letra = String(datos?.lyrics || datos?.plainLyrics || '').trim()
    if (!letra) {
      throw '[❗] No se encontraron letras para esa canción.'
    }

    await conn.sendMessage(m.chat, {
      text: construirEncabezado(datos, consulta),
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    const partes = partirLetras(letra)
    for (let i = 0; i < partes.length; i++) {
      const prefijo = partes.length > 1 ? `*Parte ${i + 1}/${partes.length}*\n\n` : ''
      await conn.sendMessage(m.chat, {
        text: `${prefijo}${partes[i]}`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }
  } catch (e) {
    console.error('Error en lyrics:', e)
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string' ? e : `[❗] Error al buscar letras.\n\n${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['ly <canción> → Letra de la canción']
handler.tags = ['descargas', 'busqueda']
handler.command = ['ly', 'lyrics', 'lyric', 'letra', 'letras']

export default handler
