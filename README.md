# Velirius bot

Bot de WhatsApp multi-dispositivo basado en **Baileys** e impulsado por **Apireon REST API**. Incluye descargas multimedia, inteligencia artificial multimodal, administración avanzada de grupos, economía RPG, canvas/stickers, búsquedas y utilidades.

```bash
git clone https://github.com/lyanvalentinmail-prog/Velirius-bot.git
cd Velirius-bot
npm start
```

| Propiedad | Detalle |
|---|---|
| **Nombre** | Velirius bot |
| **Repositorio** | [github.com/lyanvalentinmail-prog/Velirius-bot](https://github.com/lyanvalentinmail-prog/Velirius-bot) |
| **API Oficial** | [Apireon API](https://apireon-36er-git-arena-fd508da9-apireon-lyanvalentinmail3-4607.vercel.app/home) (`https://apireon-36er.vercel.app/home`) |
| **Runtime** | Node.js 20+ |
| **Licencia** | GPL-3.0-or-later |

---

## Índice

1. [Requisitos](#requisitos)
2. [Inicio rápido](#inicio-rápido)
3. [Termux](#termux)
4. [Vincular cuenta](#vincular-cuenta)
5. [PM2](#pm2)
6. [Configuración](#configuración)
7. [Comandos con Apireon API](#comandos-con-apireon-api)
8. [Estructura](#estructura)

---

## Requisitos

| Componente | Detalle |
|------------|---------|
| Node.js | 20 LTS o superior |
| Git | versión reciente |
| FFmpeg | recomendado (audio, video, stickers animados y reacciones) |

---

## Inicio rápido

Windows, Linux o macOS:

```bash
git clone https://github.com/lyanvalentinmail-prog/Velirius-bot.git
cd Velirius-bot
npm install
npm start
```

En Debian/Ubuntu, si te falta FFmpeg:

```bash
sudo apt update
sudo apt install -y ffmpeg git
```

---

## Termux

Instala Termux desde [F-Droid](https://f-droid.org/packages/com.termux/) y ejecuta:

```bash
termux-setup-storage
pkg update -y && pkg upgrade -y
pkg install -y nodejs-lts git ffmpeg
cd ~
git clone https://github.com/lyanvalentinmail-prog/Velirius-bot.git
cd Velirius-bot
npm install --no-bin-links
npm start
```

---

## Vincular cuenta

El método principal de vinculación es por **código de 8 dígitos** (pairing code) o código QR.

1. Inicia el bot:
   ```bash
   cd Velirius-bot
   npm start
   ```
2. Cuando pregunte el método de sesión, escribe `code` e ingresa el número de WhatsApp con código de país (sin `+` ni espacios).
3. En WhatsApp: **Ajustes → Dispositivos vinculados → Vincular con número de teléfono** e introduce el código de 8 caracteres.

La sesión se guarda en `Sessions/`.

---

## PM2

Para mantener **Velirius bot** activo en segundo plano:

```bash
npm install -g pm2
cd ~/Velirius-bot
pm2 start index.js --name velirius-bot
pm2 save
```

| Comando | Acción |
|---------|--------|
| `pm2 status` | Estado del proceso |
| `pm2 logs velirius-bot` | Logs en vivo |
| `pm2 restart velirius-bot` | Reiniciar |
| `pm2 stop velirius-bot` | Detener |
| `pm2 delete velirius-bot` | Eliminar de PM2 |

---

## Configuración

Edita `config.js`:

| Variable | Descripción |
|----------|-------------|
| `global.owner` | Propietarios: `['codigoPaisNumero', 'Nombre', true]` |
| `global.namebot` | Nombre del bot (`'Velirius bot'`) |
| `global.packname` | Nombre por defecto en stickers (`'Velirius bot'`) |
| `global.author` | Autor por defecto en stickers |
| `global.moneda` | Moneda del RPG |
| `global.APIs` | Configuración de **Apireon API** (`lib/apireon.js`) |

---

## Comandos con Apireon API

Prefijo por defecto: `.`

- **Menú interactivo:** `.menu` / `.menu2`
- **Inteligencia Artificial (`/ai/*`):** `.chatgpt`, `.gemini`, `.claude`, `.deepseek`, `.grok`, `.copilot`, `.kora`, `.replia`, `.animg` (`nano-banana`), `.ocr`
- **Descargas (`/downloader/*`):** `.play`, `.play2`, `.video` / `.ytmp4`, `.tiktok` / `.tt`, `.ig`, `.fb`, `.spotify`, `.sc`, `.apk` / `.aptoide`
- **Búsquedas (`/search/*`):** `.google`, `.wiki`, `.yt`, `.igs`, `.pinterest`, `.imagen`, `.wall`, `.ly` / `.lyrics`, `.bsticker` / `.stickerly`, `.playstore`, `.appstore`, `.mediafire`, `.git`
- **Anime & Reacciones (`/anime/*`, `/reactions/*`):** `.anime`, `.pokedex`, `.waifu`, `.waifu2`, `.neko`, `.animequote`, `.hug`, `.kiss`, `.slap`, `.pat`, `.cuddle`, `.dance`, `.happy`, `.sad`, `.angry`, `.reir`
- **Canvas, Stickers & Herramientas (`/canvas/*`, `/tools/*`, `/shorten/*`, `/random/*`):** `.st` / `.attp` / `.ttp`, `.brat` / `.bratvideo`, `.sw` / `.qc` / `.iqc`, `.imgay`, `.sgay`, `.ship`, `.sebusca`, `.invert`, `.qr`, `.traduc`, `.clima`, `.calc`, `.divisa`, `.acortar`, `.ping`, `.8ball`, `.chiste`, `.dato`

---

## Estructura

```text
Velirius-bot/
├── config.js         Configuración global de Velirius bot y Apireon
├── index.js          Punto de entrada y supervisor
├── main.js           Conexión Baileys MD y gestor de plugins
├── handler.js        Despachador de mensajes y comandos
├── lib/apireon.js    Cliente central para Apireon REST API
├── lib/              Utilidades, modos IA, tableros y menús
├── plugins/          Comandos recargables en caliente
├── storage/          Banner oficial y recursos persistentes
└── Sessions/         Sesión de WhatsApp (no versionar)
```

---

*Velirius bot — Powered by Apireon API*
