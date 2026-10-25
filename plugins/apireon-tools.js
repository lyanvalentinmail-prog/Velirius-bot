import { apireonJson, apireonBuffer, apireonAbsUrl, bufferToDataUrl } from '../lib/apireon.js'
import { decodeImageToPng } from '../lib/image-buffer.js'

function resolverImagenMensaje(m) {
  if (m.quoted) {
    const mime = (m.quoted.msg || m.quoted).mimetype || m.quoted.mediaType || ''
    if (/image|webp|sticker/i.test(mime) && m.quoted.download) return { msg: m.quoted, mime }
  }
  const mime = (m.msg || m).mimetype || m.mediaType || ''
  if (/image|webp|sticker/i.test(mime) && m.download) return { msg: m, mime }
  return null
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const cmd = String(command || '').toLowerCase()
  const entrada = (text || args.join(' ') || '').trim()

  try {
    // 1. Ping / Estado Apireon
    if (cmd === 'apiping' || cmd === 'ping') {
      const t0 = Date.now()
      const { result, baseUrl } = await apireonJson('/tools/ping')
      const latencia = Date.now() - t0
      const info =
        `ִֶָ☾. *Estado de Velirius bot & Apireon* ִֶָ☾.\n\n` +
        `𓍯 *Estado API:* ${result?.pong ? 'En línea ✅' : 'Activo ✅'}\n` +
        `𓍯 *Latencia:* ${latencia} ms\n` +
        `𓍯 *Uptime API:* ${result?.uptimeFormatted || '—'}\n` +
        `𓍯 *Node:* ${result?.node || process.version}\n` +
        `𓍯 *Servidor:* ${baseUrl}`
      return conn.sendMessage(m.chat, { text: info, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    // 2. Wikipedia
    if (cmd === 'wiki' || cmd === 'wikipedia') {
      if (!entrada) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Ingresa un término para buscar en *Wikipedia*.\n\n> *Ejemplo:* ${usedPrefix + command} Inteligencia artificial`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result, baseUrl } = await apireonJson('/search/wiki', { query: entrada, lang: 'es' })
      const titulo = result?.title || entrada
      const extracto = result?.extract || result?.description || 'Sin resumen disponible.'
      const url = result?.url || ''
      const miniatura = apireonAbsUrl(result?.thumbnail || '', baseUrl)

      const cuerpo =
        `ִֶָ☾. *Wikipedia — ${titulo}*\n\n` +
        `${extracto}\n` +
        (url ? `\n🔗 ${url}` : '')

      if (miniatura) {
        return conn.sendMessage(m.chat, {
          image: { url: miniatura },
          caption: cuerpo,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    // 3. Clima
    if (cmd === 'clima' || cmd === 'tiempo') {
      if (!entrada) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Ingresa una ciudad para consultar el clima.\n\n> *Ejemplo:* ${usedPrefix + command} Montevideo`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result } = await apireonJson('/tools/clima', { ciudad: entrada })
      const cuerpo =
        `ִֶָ☾. *Clima en ${result?.city || entrada}${result?.country ? `, ${result.country}` : ''}* ִֶָ☾.\n\n` +
        `🌡️ *Temperatura:* ${result?.temperatureC ?? '—'}°C (${result?.temperatureF ?? '—'}°F)\n` +
        `🤔 *Sensación:* ${result?.feelsLikeC ?? '—'}°C\n` +
        `☁️ *Condición:* ${result?.condition || '—'}\n` +
        `💧 *Humedad:* ${result?.humidityPercent ?? '—'}%\n` +
        `💨 *Viento:* ${result?.windKmh ?? '—'} km/h\n` +
        `🕒 *Zona horaria:* ${result?.timezone || '—'}`
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    // 4. Calculadora científica
    if (cmd === 'calc' || cmd === 'calculadora') {
      if (!entrada) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Ingresa una expresión matemática.\n\n> *Ejemplo:* ${usedPrefix + command} sqrt(144) + 5^2`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result } = await apireonJson('/tools/calculadora', { expresion: entrada })
      const cuerpo =
        `ִֶָ☾. *Calculadora — Velirius bot*\n\n` +
        `𓍯 *Expresión:* ${result?.expression || entrada}\n` +
        `𓍯 *Resultado:* *${result?.formatted ?? result?.result ?? '—'}*` +
        (result?.binary ? `\n𓍯 *Binario:* ${result.binary}` : '') +
        (result?.hex ? `\n𓍯 *Hex:* ${result.hex}` : '')
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    // 5. Conversor de divisas
    if (cmd === 'divisa' || cmd === 'cambio') {
      const [montoRaw, desdeRaw, haciaRaw] = args
      if (!montoRaw || !desdeRaw || !haciaRaw) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Uso: *${usedPrefix + command} <monto> <de> <a>*\n\n> *Ejemplo:* ${usedPrefix + command} 100 USD UYU`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result } = await apireonJson('/tools/moneda', {
        amount: montoRaw,
        from: desdeRaw.toUpperCase(),
        to: haciaRaw.toUpperCase()
      })
      const cuerpo =
        `ִֶָ☾. *Conversión de Divisas*\n\n` +
        `💱 *${result?.amount ?? montoRaw} ${result?.from || desdeRaw.toUpperCase()}* = ` +
        `*${result?.converted ?? result?.result ?? '—'} ${result?.to || haciaRaw.toUpperCase()}*` +
        (result?.rate ? `\n📈 *Tasa:* 1 ${desdeRaw.toUpperCase()} = ${result.rate} ${haciaRaw.toUpperCase()}` : '')
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    // 6. Acortador de enlaces
    if (cmd === 'acortar' || cmd === 'short' || cmd === 'shorten') {
      const enlace = entrada || (m.quoted?.text || '').trim()
      if (!enlace || !/^https?:\/\//i.test(enlace)) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Ingresa un enlace válido con *http://* o *https://*.\n\n> *Ejemplo:* ${usedPrefix + command} https://github.com`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result, baseUrl } = await apireonJson('/shorten/create', { url: enlace })
      const urlCorta = apireonAbsUrl(result?.shortUrl || result?.shortPath || '', baseUrl)
      return conn.sendMessage(m.chat, {
        text: `ִֶָ☾. *Enlace acortado — Velirius bot*\n\n🔗 *Corto:* ${urlCorta}\n🌐 *Original:* ${result?.targetUrl || enlace}`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    // 7. Anime Search / Random / Top / Quote / Pokedex
    if (cmd === 'anime' || cmd === 'animeinfo') {
      if (!entrada) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Ingresa el nombre de un anime.\n\n> *Ejemplo:* ${usedPrefix + command} Solo Leveling`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result, baseUrl } = await apireonJson('/anime/search', { query: entrada, limit: 3 })
      const lista = result?.results || result?.animes || (result?.title ? [result] : [])
      const a = lista[0]
      if (!a) throw new Error('No se encontró ese anime.')
      const img = apireonAbsUrl(a.image || a.cover || a.images?.jpg?.large_image_url || '', baseUrl)
      const cuerpo =
        `ִֶָ☾. *${a.title || entrada}* ִֶָ☾.\n\n` +
        (a.titleJapanese ? `𓍯 *Japonés:* ${a.titleJapanese}\n` : '') +
        (a.type ? `𓍯 *Tipo:* ${a.type}\n` : '') +
        (a.episodes ? `𓍯 *Episodios:* ${a.episodes}\n` : '') +
        (a.score ? `𓍯 *Puntaje:* ⭐ ${a.score}\n` : '') +
        (a.status ? `𓍯 *Estado:* ${a.status}\n` : '') +
        (a.genres?.length ? `𓍯 *Géneros:* ${Array.isArray(a.genres) ? a.genres.join(', ') : a.genres}\n` : '') +
        (a.synopsis ? `\n📝 ${String(a.synopsis).slice(0, 600)}` : '') +
        (a.url ? `\n\n🔗 ${a.url}` : '')

      if (img) {
        return conn.sendMessage(m.chat, { image: { url: img }, caption: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
      }
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    if (cmd === 'pokedex' || cmd === 'pokemon') {
      if (!entrada) {
        return conn.sendMessage(m.chat, {
          text: `ִֶָ☾. Ingresa el nombre o número de un Pokémon.\n\n> *Ejemplo:* ${usedPrefix + command} pikachu`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result, baseUrl } = await apireonJson('/anime/pokedex', { pokemon: entrada.toLowerCase(), query: entrada.toLowerCase() })
      const img = apireonAbsUrl(result?.sprite || result?.artwork || result?.image || '', baseUrl)
      const tipos = Array.isArray(result?.types) ? result.types.join(', ') : (result?.types || '—')
      const habilidades = Array.isArray(result?.abilities) ? result.abilities.join(', ') : (result?.abilities || '—')
      const cuerpo =
        `ִֶָ☾. *Pokédex — #${result?.id || '?'} ${result?.name || entrada}*\n\n` +
        `𓍯 *Tipos:* ${tipos}\n` +
        `𓍯 *Altura:* ${result?.height ?? '—'} · *Peso:* ${result?.weight ?? '—'}\n` +
        `𓍯 *Habilidades:* ${habilidades}` +
        (result?.description ? `\n\n📝 ${result.description}` : '')

      if (img) {
        return conn.sendMessage(m.chat, { image: { url: img }, caption: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
      }
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    if (cmd === 'animequote' || cmd === 'fraseanime') {
      const { result } = await apireonJson('/anime/quote')
      const cuerpo =
        `ִֶָ☾. *Cita Anime*\n\n` +
        `❝ ${result?.quote || '—'} ❞\n\n` +
        `— *${result?.character || 'Desconocido'}* (${result?.anime || 'Anime'})`
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    // 8. Random: 8ball, fact, joke, quote
    if (cmd === '8ball' || cmd === 'bola8') {
      if (!entrada) {
        return conn.sendMessage(m.chat, {
          text: `🎱 Hazle una pregunta a la bola mágica.\n> *Ejemplo:* ${usedPrefix + command} ¿Hoy tendré suerte?`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const { result } = await apireonJson('/random/8ball', { question: entrada })
      const cuerpo =
        `🎱 *Bola 8 Mágica — Velirius bot*\n\n` +
        `❓ *Pregunta:* ${result?.question || entrada}\n` +
        `✨ *Respuesta:* *${result?.answer || 'Sí'}*`
      return conn.sendMessage(m.chat, { text: cuerpo, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    if (cmd === 'chiste' || cmd === 'joke') {
      const { result } = await apireonJson('/random/joke')
      const chiste = result?.joke || (result?.setup ? `${result.setup}\n\n— ${result.punchline || result.delivery || ''}` : JSON.stringify(result))
      return conn.sendMessage(m.chat, { text: `😂 *Chiste*\n\n${chiste}`, contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    if (cmd === 'dato' || cmd === 'fact') {
      const { result } = await apireonJson('/random/fact')
      return conn.sendMessage(m.chat, {
        text: `💡 *Dato curioso*\n\n${result?.fact || result?.text || '—'}`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    // 9. Canvas: ship, sebusca (wanted), invert
    if (cmd === 'ship' || cmd === 'pareja') {
      const mencionados = m.mentionedJid || []
      const u1 = mencionados[0] || m.sender
      const u2 = mencionados[1] || m.quoted?.sender
      if (!u2) {
        return conn.sendMessage(m.chat, {
          text: `💞 Menciona a 1 o 2 usuarios (o responde a alguien).\n> *Ejemplo:* ${usedPrefix + command} @usuario`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const n1 = conn.getName(u1) || u1.split('@')[0]
      const n2 = conn.getName(u2) || u2.split('@')[0]
      let av1 = ''
      let av2 = ''
      try { av1 = await conn.profilePictureUrl(u1, 'image') } catch {}
      try { av2 = await conn.profilePictureUrl(u2, 'image') } catch {}

      const { buffer } = await apireonBuffer('/canvas/ship', {
        name1: n1,
        name2: n2,
        ...(av1 ? { avatar1: av1 } : {}),
        ...(av2 ? { avatar2: av2 } : {})
      })

      return conn.sendMessage(m.chat, {
        image: buffer,
        caption: `💞 * Compatibilidad entre @${u1.split('@')[0]} y @${u2.split('@')[0]} *`,
        contextInfo: { ...rcanal?.contextInfo, mentionedJid: [u1, u2] }
      }, { quoted: m })
    }

    if (cmd === 'sebusca' || cmd === 'wanted' || cmd === 'invert' || cmd === 'invertir') {
      const medio = resolverImagenMensaje(m)
      let imageParam = ''

      if (medio) {
        const raw = await medio.msg.download()
        const png = await decodeImageToPng(raw, medio.mime)
        imageParam = bufferToDataUrl(png, 'image/png')
      } else {
        const jidObjetivo = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
        try {
          imageParam = await conn.profilePictureUrl(jidObjetivo, 'image')
        } catch {}
      }

      if (!imageParam) {
        return conn.sendMessage(m.chat, {
          text: `*[❗] Responde a una imagen o menciona a un usuario con foto de perfil pública.*`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }

      const ruta = cmd.startsWith('inv') ? '/canvas/invert' : '/canvas/sebusca'
      const { buffer } = await apireonBuffer(
        ruta,
        { image: imageParam },
        { method: imageParam.startsWith('data:') ? 'POST' : 'GET' }
      )

      return conn.sendMessage(m.chat, {
        image: buffer,
        caption: cmd.startsWith('inv') ? `🎨 *Imagen invertida*` : `🤠 *¡SE BUSCA!*`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }
  } catch (e) {
    console.error(`[apireon-tools:${cmd}]`, e)
    return conn.sendMessage(m.chat, {
      text: `[❌] Error ejecutando *${usedPrefix + command}*:\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = [
  'ping',
  'wiki <tema>',
  'clima <ciudad>',
  'calc <expresión>',
  'divisa <monto> <de> <a>',
  'acortar <url>',
  'anime <nombre>',
  'pokedex <pokemon>',
  'animequote',
  '8ball <pregunta>',
  'chiste',
  'dato',
  'ship @usuario',
  'sebusca [foto/@usuario]',
  'invert [foto]'
]
handler.tags = ['herramientas', 'anime', 'buscador', 'diversion']
handler.command = [
  'ping',
  'apiping',
  'wiki',
  'wikipedia',
  'clima',
  'tiempo',
  'calc',
  'calculadora',
  'divisa',
  'cambio',
  'acortar',
  'short',
  'shorten',
  'anime',
  'animeinfo',
  'pokedex',
  'pokemon',
  'animequote',
  'fraseanime',
  '8ball',
  'bola8',
  'chiste',
  'joke',
  'dato',
  'fact',
  'ship',
  'pareja',
  'sebusca',
  'wanted',
  'invert',
  'invertir'
]

export default handler
