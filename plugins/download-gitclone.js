import fs from 'fs'
import fetch from 'node-fetch'
import { apireonJson } from '../lib/apireon.js'

const REGEX_GH = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:\s]+)\/([^\/\s]+)/i

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  const entrada = (text || args.join(' ') || '').trim()
  if (!entrada) {
    return m.reply(
      `*[❗] Escribe la URL o búsqueda de un repositorio de GitHub.*\n\n> Ejemplo: ${usedPrefix + command} https://github.com/usuario/repositorio`
    )
  }

  try {
    let urlFinal = entrada
    if (!REGEX_GH.test(urlFinal)) {
      const { result } = await apireonJson('/search/github', { query: entrada, limit: 5 })
      const repos = result?.repositories || result?.repos || result?.items || result?.results || []
      const primero = Array.isArray(repos) ? repos.find(r => r?.url || r?.html_url) : null
      if (!primero) {
        return m.reply(`[❗] No se encontraron repositorios en GitHub para *${entrada}*.`)
      }
      urlFinal = primero.url || primero.html_url
    }

    const match = urlFinal.match(REGEX_GH)
    if (!match) {
      return m.reply(`[❗] Verifica que la URL sea de GitHub\n\n> Ejemplo: ${usedPrefix + command} https://github.com/usuario/repositorio`)
    }

    const usuario = match[1]
    const repoLimpio = match[2].replace(/\.git$/i, '')
    const urlRepo = `https://api.github.com/repos/${usuario}/${repoLimpio}`
    const urlZip = `https://api.github.com/repos/${usuario}/${repoLimpio}/zipball`

    const [respuestaRepo, respuestaZip] = await Promise.all([
      fetch(urlRepo, { headers: { 'User-Agent': 'VeliriusBot/1.0' } }),
      fetch(urlZip, { headers: { 'User-Agent': 'VeliriusBot/1.0' } })
    ])

    if (!respuestaRepo.ok) {
      return m.reply(`[❌] No se pudo acceder al repositorio. Verifica que exista y sea público.`)
    }
    if (!respuestaZip.ok) {
      return m.reply(`[❌] No se pudo descargar el archivo ZIP del repositorio.`)
    }

    const datosRepo = await respuestaRepo.json()
    const disposicionContenido = respuestaZip.headers.get('content-disposition')
    let nombreArchivo = `${repoLimpio}.zip`
    if (disposicionContenido) {
      const coincidencia = disposicionContenido.match(/attachment;\s*filename="?([^";]+)"?/i)
      if (coincidencia?.[1]) nombreArchivo = coincidencia[1]
    }

    const txt = `ִֶָ☾. *GitHub Download — Velirius bot*

𓂃 ࣪ ִֶָ☾. *Archivo:* ${nombreArchivo}
𓂃 ࣪ ִֶָ☾. *Repositorio:* ${usuario}/${repoLimpio}
𓂃 ࣪ ִֶָ☾. *Creador:* ${datosRepo.owner?.login || usuario}
𓂃 ࣪ ִֶָ☾. *Estrellas:* ⭐ ${datosRepo.stargazers_count ?? 0}
𓂃 ࣪ ִֶָ☾. *Descripción:* ${datosRepo.description || 'Sin descripción disponible'}
𓂃 ࣪ ִֶָ☾. *URL:* https://github.com/${usuario}/${repoLimpio}`

    let buferImg = null
    if (datosRepo.owner?.avatar_url) {
      try {
        const rImg = await fetch(datosRepo.owner.avatar_url)
        if (rImg.ok) buferImg = Buffer.from(await rImg.arrayBuffer())
      } catch {}
    }
    if (!buferImg && fs.existsSync('./storage/img/menu3.jpg')) {
      buferImg = fs.readFileSync('./storage/img/menu3.jpg')
    }

    if (buferImg) {
      await conn.sendMessage(m.chat, {
        image: buferImg,
        caption: txt,
        contextInfo: { ...rcanal?.contextInfo, mentionedJid: [m.sender] }
      }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: { ...rcanal?.contextInfo, mentionedJid: [m.sender] }
      }, { quoted: m })
    }

    const buferZip = Buffer.from(await respuestaZip.arrayBuffer())
    await conn.sendMessage(m.chat, {
      document: buferZip,
      fileName: nombreArchivo,
      mimetype: 'application/zip',
      contextInfo: { ...rcanal?.contextInfo, mentionedJid: [m.sender] }
    }, { quoted: m })
  } catch (error) {
    console.error('Error en gitclone:', error)
    m.reply(`*[❌] Ocurrió un error al procesar el repositorio.*\n\n> Error: ${error.message}`)
  }
}

handler.help = ['git <url|búsqueda>', 'gitclone <url>']
handler.tags = ['descargas']
handler.command = ['git', 'gitclone', 'github']

export default handler
