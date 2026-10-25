import { apireonJson } from './apireon.js'

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export function extraerTextoIa(payload) {
  if (payload == null) return ''
  if (typeof payload === 'string') return payload.trim()
  if (typeof payload !== 'object') return String(payload).trim()

  const r = payload.result ?? payload.data ?? payload
  if (typeof r === 'string' && r.trim()) return r.trim()

  const candidatos = [
    r?.response,
    r?.reply,
    r?.answer,
    r?.text,
    r?.message,
    r?.result,
    payload.response,
    payload.reply,
    payload.text,
    payload.result,
    payload.message,
    payload.msg
  ]

  for (const c of candidatos) {
    if (typeof c === 'string' && c.trim()) return c.trim()
  }
  return ''
}

export function esRespuestaIaInutil(texto = '') {
  const t = String(texto || '').trim()
  if (!t) return true
  if (/^error:/i.test(t)) return true
  if (/no wiz data/i.test(t)) return true
  if (/no response/i.test(t)) return true
  if (/rate limit/i.test(t)) return true
  if (/refused to respond/i.test(t)) return true
  return false
}

export async function consultarModeloApireon(modelo = 'chatgpt', texto = '', {
  systemPrompt = '',
  image = '',
  timeout = 55000
} = {}) {
  const consulta = String(texto || '').trim()
  if (!consulta) return ''

  const endpoint = `/ai/${String(modelo || 'chatgpt').replace(/^\/+/, '')}`
  const params = { prompt: consulta }
  if (systemPrompt) params.system = systemPrompt

  if (image && image.startsWith('data:')) {
    const { raw, result } = await apireonJson(
      endpoint,
      {},
      {
        method: 'POST',
        body: { ...params, image },
        timeout
      }
    )
    return extraerTextoIa(result) || extraerTextoIa(raw)
  }

  if (image) params.image = image
  const { raw, result } = await apireonJson(endpoint, params, { timeout })
  return extraerTextoIa(result) || extraerTextoIa(raw)
}

export async function consultarIaApireon(texto, {
  modeloPreferido = 'chatgpt',
  systemPrompt = '',
  image = '',
  intentosPorProveedor = 2,
  incluirRipleai = false
} = {}) {
  const consulta = String(texto || '').trim()
  if (!consulta) return ''

  const ordenModelos = [
    modeloPreferido,
    ...(incluirRipleai ? ['grok'] : []),
    'chatgpt',
    'gemini',
    'claude',
    'deepseek',
    'copilot',
    'grok'
  ].filter((v, idx, arr) => v && arr.indexOf(v) === idx)

  let ultimoError = ''
  for (const modelo of ordenModelos) {
    for (let i = 0; i < intentosPorProveedor; i++) {
      try {
        const out = await consultarModeloApireon(modelo, consulta, {
          systemPrompt,
          image: modelo === 'gemini' ? image : ''
        })
        if (!esRespuestaIaInutil(out)) return out
        ultimoError = out || `vacío (${modelo})`
      } catch (e) {
        ultimoError = e?.message || String(e)
      }
      if (i < intentosPorProveedor - 1) await sleep(500)
    }
  }

  if (ultimoError) {
    console.warn('[apireon-ia] sin respuesta útil. último:', ultimoError)
  }
  return ''
}

export const consultarIaDelirius = consultarIaApireon

export function formatearPensamiento(respuestaApi = '') {
  let pensamiento = ''
  let respuestaFinal = String(respuestaApi || '')

  const match = respuestaFinal.match(/<think>([\s\S]*?)<\/think>/)
  if (match) {
    pensamiento = match[1].trim()
    respuestaFinal = respuestaFinal.replace(/<think>[\s\S]*?<\/think>/, '').trim()
  }

  let out = ''
  if (pensamiento) {
    out += `> *Su pensamiento:* ${pensamiento.replace(/\n+/g, ' ').trim()}\n\n`
  }
  out += respuestaFinal
  return out
}
