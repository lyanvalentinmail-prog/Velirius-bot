import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const LIMITE_RESULTADOS = 5

function recortarTexto(text = '', max = 100) {
  const valor = String(text).replace(/\s+/g, ' ').trim()
  if (!valor || valor === '-') return ''
  return valor.length > max ? `${valor.slice(0, max - 1)}…` : valor
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text?.trim()) {
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. Ingresa el nombre de la canción.\n\n> *Ejemplo:*\n${usedPrefix + command} After Dark`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const consulta = text.trim()
    await m.react('⏳').catch(() => {})

    const { result, baseUrl } = await apireonJson('/search/spotify', { query: consulta, limit: LIMITE_RESULTADOS })
    const pistas = Array.isArray(result?.tracks) ? result.tracks : []

    if (!pistas.length) {
      throw `[❗] No se encontraron resultados musicales para *${consulta}*.`
    }

    const resultados = pistas.slice(0, LIMITE_RESULTADOS).map(p => ({
      title: p.title || 'Canción',
      artist: p.artist || 'Artista',
      album: p.album || 'Single',
      duration: p.durationFormatted || '—',
      link: p.appleMusicUrl || p.spotifySearchUrl || '',
      image: apireonAbsUrl(p.artwork || '', baseUrl)
    }))

    if (!global.lastScSearch) global.lastScSearch = {}
    global.lastScSearch[m.sender] = {
      query: consulta,
      results: resultados,
      at: Date.now()
    }

    let lista =
      `ִֶָ☾. 𝗦𝗼𝘂𝗻𝗱𝗖𝗹𝗼𝘂𝗱 / 𝗠𝘂𝘀𝗶𝗰 𝗦𝗲𝗮𝗿𝗰𝗵 ִֶָ☾.\n\n` +
      `> *Búsqueda:* ${consulta}\n` +
      `> *Encontrados:* ${resultados.length}\n\n`

    resultados.forEach((elemento, i) => {
      lista += `*${i + 1}.* ${recortarTexto(elemento.title, 70)}\n`
      lista += ` 𓍯  *Artista:* ${recortarTexto(elemento.artist, 40)}\n`
      lista += ` 𓍯  *Álbum:* ${recortarTexto(elemento.album, 45)}\n`
      lista += ` 𓍯  *Duración:* ${elemento.duration}\n`
      if (elemento.link) lista += ` 𓍯  *Enlace:* ${elemento.link}\n`
      lista += '\n'
    })
    lista += `> Descargar:\n> ${usedPrefix}sc <número>\n> ${usedPrefix}sc <nombre>`

    const primeraPortada = resultados.find(r => r.image)?.image
    if (primeraPortada) {
      try {
        await conn.sendMessage(
          m.chat,
          { image: { url: primeraPortada }, caption: lista.trim(), contextInfo: { ...rcanal?.contextInfo } },
          { quoted: m }
        )
        await m.react('✅').catch(() => {})
        return
      } catch {}
    }

    await conn.sendMessage(
      m.chat,
      { text: lista.trim(), contextInfo: { ...rcanal?.contextInfo } },
      { quoted: m }
    )
    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('Error en scsearch:', e)
    await m.react('❌').catch(() => {})
    return conn.sendMessage(m.chat, {
      text: typeof e === 'string' ? e : `[❗] Error al buscar música.\n\n${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['scsearch <búsqueda>', 'scs <búsqueda>']
handler.tags = ['descargas']
handler.command = ['scsearch', 'scs', 'soundcloudsearch']
handler.group = true

export default handler
