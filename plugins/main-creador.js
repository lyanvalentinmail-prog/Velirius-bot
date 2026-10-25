let handler = async (m, { conn }) => {
  const owners = Array.isArray(global.owner) ? global.owner : []
  const validos = owners.filter(([num]) => num && !/tunumero|acael|xxx/i.test(String(num)))

  if (!validos.length) {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:;Velirius bot;;',
      'FN:Velirius bot',
      'ORG:Velirius bot',
      'X-WA-BIZ-DESCRIPTION:Creador oficial de Velirius bot',
      'X-WA-BIZ-NAME:Velirius bot',
      'END:VCARD'
    ].join('\n')

    return conn.sendMessage(m.chat, {
      contacts: {
        displayName: 'Velirius bot',
        contacts: [{ vcard }]
      }
    }, { quoted: m })
  }

  const contacts = validos.map(([num, nombre]) => {
    const digitos = String(num).replace(/\D/g, '')
    const etiqueta = nombre || 'Velirius bot'
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:;${etiqueta};;`,
      `FN:${etiqueta}`,
      `ORG:${global.namebot || 'Velirius bot'}`,
      `item1.TEL;waid=${digitos}:${digitos}`,
      'item1.X-ABLabel:Owner',
      `X-WA-BIZ-NAME:${etiqueta}`,
      'END:VCARD'
    ].join('\n')
    return { vcard }
  })

  await conn.sendMessage(m.chat, {
    contacts: {
      displayName: 'Contactos — Velirius bot',
      contacts
    }
  }, { quoted: m })
}

handler.command = ['owner', 'creator', 'creador', 'dueño']

export default handler
