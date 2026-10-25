import { apireonBuffer, apireonJson, apireonAbsUrl } from '../lib/apireon.js'

function formatearMs(ms) {
  const seg = Math.floor((Number(ms) || 0) / 1000)
  if (!seg) return '—'
  const m = Math.floor(seg / 60)
  const s = String(seg % 60).padStart(2, '0')
  return `${m}:${s}`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `ִֶָ☾. Ingresa el nombre o enlace de la canción de *Spotify*.\n\n> *Ejemplo:* ${usedPrefix + command} Blinding Lights`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  try {
    await m.react('⏳').catch(() => {})
    const consulta = text.trim()

    if (/album/i.test(command)) {
      const { result, baseUrl } = await apireonJson('/search/spotifyalbum', { query: consulta, limit: 5 })
      const albums = result?.albums || result?.items || result?.results || []
      if (!Array.isArray(albums) || !albums.length) {
        return conn.sendMessage(m.chat, {
          text: `[❗] No se encontraron álbumes en Spotify para *${consulta}*.`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      let cuerpo = `ִֶָ☾. *Álbumes en Spotify*\n\n`
      albums.slice(0, 5).forEach((alb, idx) => {
        cuerpo += `*${idx + 1}.* ${alb.name || alb.title || 'Álbum'}\n`
        if (alb.artist || alb.artistName) cuerpo += `> *Artista:* ${alb.artist || alb.artistName}\n`
        if (alb.releaseDate) cuerpo += `> *Lanzamiento:* ${alb.releaseDate}\n`
        if (alb.totalTracks || alb.trackCount) cuerpo += `> *Canciones:* ${alb.totalTracks || alb.trackCount}\n`
        if (alb.url || alb.collectionViewUrl) cuerpo += `> *Link:* ${alb.url || alb.collectionViewUrl}\n`
        cuerpo += '\n'
      })
      const portada = apireonAbsUrl(albums[0]?.artwork || albums[0]?.image || albums[0]?.cover || '', baseUrl)
      if (portada) {
        await conn.sendMessage(m.chat, {
          image: { url: portada },
          caption: cuerpo.trim(),
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          text: cuerpo.trim(),
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      await m.react('✅').catch(() => {})
      return
    }

    const { result, baseUrl } = await apireonJson('/search/spotify', { query: consulta, limit: 3 })
    const pistas = Array.isArray(result?.tracks) ? result.tracks : []
    if (!pistas.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron resultados en Spotify para *${consulta}*.`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const pista = pistas[0]
    const titulo = pista.title || 'Canción'
    const artista = pista.artist || 'Artista'
    const album = pista.album || 'Single'
    const duracion = pista.durationFormatted || formatearMs(pista.durationMs)
    const fecha = (pista.releaseDate || '').slice(0, 10) || '—'
    const portada = apireonAbsUrl(pista.artwork || pista.image || '', baseUrl)
    const enlace = pista.appleMusicUrl || pista.spotifySearchUrl || `https://open.spotify.com/search/${encodeURIComponent(`${titulo} ${artista}`)}`

    const texto = `ִֶָ☾. *Spotify Music* ִֶָ☾.

𓍯 *Título:* ${titulo}
𓍯 *Artista:* ${artista}
𓍯 *Álbum:* ${album}
𓍯 *Duración:* ${duracion}
𓍯 *Lanzamiento:* ${fecha}
𓍯 *Enlace:* ${enlace}`

    if (portada) {
      try {
        await conn.sendMessage(m.chat, {
          image: { url: portada },
          caption: texto,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      } catch {
        await conn.sendMessage(m.chat, {
          text: texto,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
    } else {
      await conn.sendMessage(m.chat, {
        text: texto,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const consultaAudio = `${titulo} ${artista} official audio`
    const audioDescarga = await apireonBuffer('/downloader/play', { query: consultaAudio })

    await conn.sendMessage(m.chat, {
      audio: audioDescarga.buffer,
      fileName: `${titulo}.mp3`,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[spotify] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error procesando Spotify.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['spotify <canción>', 'splay <canción>', 'spotifyalbum <álbum>']
handler.tags = ['descargas']
handler.command = ['spotify', 'splay', 'spotifyalbum']

export default handler
