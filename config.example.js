/* Velirius bot
   Copia este archivo como config.js y edítalo:
   cp config.example.js config.js
*/

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// CAMBIA POR EL NUMERO QUE VA SER OWNER DEL BOT
global.owner = [
  ['tunumero', 'Velirius', true],
]

// ACA PON EL LID DEL OWNER DEL BOT PARA QUE TE HAGA CASO COMO OWNER EL BOT, USA EL COMANDO /ID EN TU
// PRIVADO PARA SACAR TU LID
global.ownerLid = [
  ['acaElLid', 'Velirius', true],
]

global.sessions = 'Sessions'
global.bot = 'Serbot'
global.AFBots = true

global.packname = 'Velirius bot'
global.namebot = 'Velirius bot'
global.author = 'Velirius'
global.moneda = 'USD'

// Etiqueta de canal en mensajes (rcanal). Obtén el JID con: .canalid <link del canal>
global.canal = ''

// Canales que el bot y sub-bots siguen al conectar (JID @newsletter o link del canal)
global.ch = {
  ch1: '',
}

// Canal para logs/anuncios de sub-bots (también se sigue al conectar junto con global.ch)
global.logssubbots = ''

// Botones/listas interactivas con @itsliaaa/baileys (conexión sigue con @whiskeysockets/baileys)
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
