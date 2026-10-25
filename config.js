/* Velirius bot
*/

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// CAMBIA POR EL NUMERO O TU wa.me/@usuario DEL OWNER
// Ejemplos válidos:
//   ['51999999999', 'Velirius', true]
//   ['wa.me/@Velirius', 'Velirius', true]
//   ['@Velirius', 'Velirius', true]
global.owner = [
  ['wa.me/@Velirius', 'Velirius', true]
]

// ACA PON EL LID DEL OWNER DEL BOT PARA QUE TE HAGA CASO COMO OWNER EL BOT, USA EL COMANDO /ID EN TU
// PRIVADO PARA SACAR TU LID
global.ownerLid = [
  ['198119006412828', 'Velirius', true],
  ['138079390183445', 'Javi(Mod)', true],
]

global.sessions = 'Sessions'
global.bot = 'Serbot'
global.AFBots = true

global.packname = 'Velirius bot'
global.namebot = 'Velirius bot'
global.author = 'Velirius'
global.moneda = 'USD'

// Etiqueta de canal en mensajes (rcanal). Obtén el JID con: .canalid <link del canal>
// Ejemplo: global.canal = { jid: '120363423390538090@newsletter', name: 'Velirius Community' }
// También acepta link: global.canal = 'https://whatsapp.com/channel/XXXXXXXX'
global.canal = { jid: '120363405059433072@newsletter', name: 'Velirius bot' }

// Canales que el bot y sub-bots siguen al conectar.
// Puedes usar el JID (recomendado) o el link del canal:
// ch1: '120363405059433072@newsletter'
global.ch = {
  ch1: '120363405059433072@newsletter',
}

// Canal para logs/anuncios de sub-bots. El bot y sub-bots también lo siguen al conectar.
global.logssubbots = '120363430965244922@newsletter'

// true = botones/listas con @itsliaaa/baileys | false = solo @whiskeysockets/baileys
global.baileysInteractive = true

global.mods = []
global.prems = []

global.multiplier = 69
global.maxwarn = '2'

// APIS QUE USA EL BOT EN GLOBAL (NO BORRES)
global.APIs = {
  apireon: {
    url: 'https://apireon-36er-git-arena-fd508da9-apireon-lyanvalentinmail3-4607.vercel.app',
    fallbackUrl: 'https://apireon-36er.vercel.app',
    home: 'https://apireon-36er-git-arena-fd508da9-apireon-lyanvalentinmail3-4607.vercel.app/home',
    key: null
  }
}

import { syncRcanalFromConfig } from './lib/newsletter-rcanal.js'
syncRcanalFromConfig()

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
