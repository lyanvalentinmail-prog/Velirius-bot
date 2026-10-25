import axios from 'axios'
import { apireonJson, apireonAbsUrl } from '../lib/apireon.js'

const LIMITE_BYTES_ENVIO = 120 * 1024 * 1024

function formatearTamano(tamano) {
  if (!tamano) return '—'
  if (typeof tamano === 'string' && /[KMG]B/i.test(tamano)) return tamano
  const n = Number(tamano)
  if (!Number.isFinite(n) || n <= 0) return String(tamano)
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(2)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${n} B`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    return conn.sendMessage(m.chat, {
      text: `ִֶָ☾. Ingresa el nombre de la aplicación o archivo que deseas buscar.\n\n> *Ejemplo:* ${usedPrefix + command} WhatsApp`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }

  const consulta = text.trim()
  await m.react('⏳').catch(() => {})

  try {
    if (/^(mediafire|mf)$/i.test(command)) {
      const { result } = await apireonJson('/search/mediafire', { query: consulta, limit: 6 })
      const lista = result?.results || result?.files || result?.items || []
      if (!Array.isArray(lista) || !lista.length) {
        await m.react('❌').catch(() => {})
        return conn.sendMessage(m.chat, {
          text: `[❗] No se encontraron archivos en MediaFire para *${consulta}*.`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      let respuesta = `ִֶָ☾. *MediaFire Search*\n\n`
      lista.slice(0, 6).forEach((item, idx) => {
        respuesta += `*${idx + 1}.* ${item.title || item.name || 'Archivo'}\n`
        if (item.description || item.snippet) respuesta += `> ${item.description || item.snippet}\n`
        if (item.url || item.link) respuesta += `> *Link:* ${item.url || item.link}\n`
        respuesta += '\n'
      })
      await conn.sendMessage(m.chat, {
        text: respuesta.trim(),
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
      await m.react('✅').catch(() => {})
      return
    }

    if (/^appstore$/i.test(command)) {
      const { result, baseUrl } = await apireonJson('/search/appsstore', { query: consulta, limit: 5 })
      const apps = result?.apps || result?.results || []
      if (!Array.isArray(apps) || !apps.length) {
        await m.react('❌').catch(() => {})
        return conn.sendMessage(m.chat, {
          text: `[❗] No se encontraron aplicaciones en App Store para *${consulta}*.`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const app = apps[0]
      const icono = apireonAbsUrl(app.icon || app.artworkUrl512 || app.image || '', baseUrl)
      let leyenda = `ִֶָ☾. *App Store*\n\n`
      leyenda += `𓍯 *Nombre:* ${app.name || app.trackName || consulta}\n`
      if (app.developer || app.artistName) leyenda += `𓍯 *Desarrollador:* ${app.developer || app.artistName}\n`
      if (app.priceFormatted || app.formattedPrice) leyenda += `𓍯 *Precio:* ${app.priceFormatted || app.formattedPrice}\n`
      if (app.rating || app.averageUserRating) leyenda += `𓍯 *Valoración:* ⭐ ${Number(app.rating || app.averageUserRating).toFixed(1)}\n`
      if (app.version) leyenda += `𓍯 *Versión:* ${app.version}\n`
      if (app.url || app.trackViewUrl) leyenda += `𓍯 *Enlace:* ${app.url || app.trackViewUrl}\n`

      if (icono) {
        await conn.sendMessage(m.chat, {
          image: { url: icono },
          caption: leyenda.trim(),
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { text: leyenda.trim(), contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
      }
      await m.react('✅').catch(() => {})
      return
    }

    if (/^playstore$/i.test(command)) {
      const { result, baseUrl } = await apireonJson('/search/playstore', { query: consulta, limit: 5 })
      const apps = result?.apps || result?.results || []
      if (!Array.isArray(apps) || !apps.length) {
        await m.react('❌').catch(() => {})
        return conn.sendMessage(m.chat, {
          text: `[❗] No se encontraron aplicaciones para *${consulta}*.`,
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      }
      const app = apps[0]
      const icono = apireonAbsUrl(app.icon || app.image || '', baseUrl)
      let leyenda = `ִֶָ☾. *Google Play / Apps*\n\n`
      leyenda += `𓍯 *Nombre:* ${app.name || app.title || consulta}\n`
      if (app.package) leyenda += `𓍯 *Paquete:* ${app.package}\n`
      if (app.developer) leyenda += `𓍯 *Desarrollador:* ${app.developer}\n`
      if (app.version) leyenda += `𓍯 *Versión:* ${app.version}\n`
      if (app.size || app.sizeMB) leyenda += `𓍯 *Tamaño:* ${app.sizeMB ? `${app.sizeMB} MB` : formatearTamano(app.size)}\n`
      if (app.rating) leyenda += `𓍯 *Valoración:* ⭐ ${app.rating}\n`
      if (app.playStoreUrl || app.url) leyenda += `𓍯 *Enlace:* ${app.playStoreUrl || app.url}\n`

      if (icono) {
        await conn.sendMessage(m.chat, {
          image: { url: icono },
          caption: leyenda.trim(),
          contextInfo: { ...rcanal?.contextInfo }
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, { text: leyenda.trim(), contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
      }
      await m.react('✅').catch(() => {})
      return
    }

    // Aptoide / APK downloader
    const { result, baseUrl } = await apireonJson('/search/aptoide', { query: consulta, limit: 5 })
    const apps = Array.isArray(result?.apps) ? result.apps : []
    if (!apps.length) {
      await m.react('❌').catch(() => {})
      return conn.sendMessage(m.chat, {
        text: `[❗] No se encontraron APKs en Aptoide para *${consulta}*.`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    const app = apps[0]
    const nombre = app.name || consulta
    const paquete = app.package || 'app.android'
    const version = app.version || '—'
    const tamanoBytes = Number(app.sizeBytes || app.size || 0)
    const tamanoTexto = app.sizeMB ? `${app.sizeMB} MB` : formatearTamano(tamanoBytes)
    const descargas = app.downloads ? Number(app.downloads).toLocaleString('es-ES') : '—'
    const icono = apireonAbsUrl(app.icon || '', baseUrl)
    const apkUrl = app.apkUrl || app.downloadUrl || ''

    let infoTexto =
      `ִֶָ☾. *Aptoide APK* ִֶָ☾.\n\n` +
      `𓍯 *Nombre:* ${nombre}\n` +
      `𓍯 *Paquete:* ${paquete}\n` +
      `𓍯 *Versión:* ${version}\n` +
      `𓍯 *Tamaño:* ${tamanoTexto}\n` +
      `𓍯 *Descargas:* ${descargas}\n` +
      (app.updated ? `𓍯 *Actualizado:* ${app.updated}\n` : '') +
      (apkUrl ? `𓍯 *Descarga directa:* ${apkUrl}` : '')

    if (icono) {
      await conn.sendMessage(m.chat, {
        image: { url: icono },
        caption: infoTexto.trim(),
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m }).catch(async () => {
        await conn.sendMessage(m.chat, { text: infoTexto.trim(), contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
      })
    } else {
      await conn.sendMessage(m.chat, { text: infoTexto.trim(), contextInfo: { ...rcanal?.contextInfo } }, { quoted: m })
    }

    if (apkUrl && (!tamanoBytes || tamanoBytes <= LIMITE_BYTES_ENVIO)) {
      const respApk = await axios.get(apkUrl, {
        responseType: 'arraybuffer',
        timeout: 120000,
        maxContentLength: LIMITE_BYTES_ENVIO,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      await conn.sendMessage(m.chat, {
        document: Buffer.from(respApk.data),
        mimetype: 'application/vnd.android.package-archive',
        fileName: `${nombre.replace(/[^\w.-]+/g, '_')}_${version}.apk`,
        contextInfo: { ...rcanal?.contextInfo }
      }, { quoted: m })
    }

    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[apps] Error:', e)
    await m.react('❌').catch(() => {})
    await conn.sendMessage(m.chat, {
      text: `[❌] Error buscando o descargando la aplicación.\n> ${e.message}`,
      contextInfo: { ...rcanal?.contextInfo }
    }, { quoted: m })
  }
}

handler.help = ['apk <nombre>', 'aptoide <nombre>', 'playstore <nombre>', 'appstore <nombre>', 'mediafire <búsqueda>']
handler.tags = ['descargas']
handler.command = ['apk', 'aptoide', 'descargar', 'playstore', 'appstore', 'mediafire', 'mf']
handler.group = true

export default handler
