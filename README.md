<div align="center">

<img src="assets/header.svg" width="100%" alt="ZYRO Streaming Bot Banner" />

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/discord.js-v14.27.0-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.js.org/)
[![Render](https://img.shields.io/badge/Render-24%2F7_Ready-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com)
[![UptimeRobot](https://img.shields.io/badge/UptimeRobot-KeepAlive_200_OK-1FC77B?style=for-the-badge&logo=uptimerobot&logoColor=white)](https://uptimerobot.com)
[![Status](https://img.shields.io/badge/Status-24%2F7%20Non--Stop-10B981?style=for-the-badge&logo=statuspage&logoColor=white)](#-247-render-free-cloud-hosting)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>A resilient 24/7 Discord Streaming Presence and Persistent Voice Channel bot designed for non-stop uptime. Displays live progressive streaming timers starting from 0h and counting up infinitely with built-in Render HTTP health checks.</b>
</p>

[Features](#-key-features) • [Unlimited Timer](#-unlimited-streaming-timer) • [Render 24/7 Hosting](#-247-render-free-cloud-hosting) • [Quick Start](#-quick-start) • [Commands](#-slash-commands)

---

</div>

## 📖 Overview

**ZYRO Streaming Bot** is a high-availability, headless Node.js daemon that keeps your Discord bot permanently in **"Streaming" status** on its Discord profile 24 hours a day, 7 days a week, while maintaining persistent voice channel presence.

Unlike bots with arbitrary restrictions or resetting timers, **ZYRO** features an **unlimited continuous timer** that starts from `0h 00m` (or custom configured starting hours) and increments indefinitely. It includes a native **built-in HTTP Keep-Alive server** (`200 OK`) so you can host it 100% free on **Render** with **UptimeRobot** without the bot ever shutting down!

---

## ⏱️ Unlimited Streaming Timer

- **Starts from 0h by default:** When the bot is invited, it starts from `0h 00m` and counts up infinitely: `1h`, `50h`, `500h`, `5,000h`, `10,000h+`.
- **Live Profile Presence:** Automatically renders rich streaming status on the bot's profile:
  ```text
  🟣 Streaming: 12h 45m elapsed
  ```
- **Persistent State Recovery:** Uptime is computed from reference start timestamps stored in `data/timer-state.json`. Even if the host restarts, the timer **never resets back to 0 or 5000**—it resumes its exact cumulative progress!
- **Customizable / Reset:** Server administrators can use `/reset [hours]` to reset or initialize the timer to any starting value (e.g. `0`, `100`, `5000`).

---

## ✨ Key Features

- 🟣 **Live Discord Streaming Activity:** Streams to Twitch or YouTube with valid HTTPS verification and clickable profile links.
- 🎙️ **Persistent 24/7 Voice Channel Connection:** Pinned to your desired voice channel (`/setvoice`), with automated exponential-backoff reconnects on network blips.
- 🌐 **Built-in HTTP Keep-Alive Server:** Binds to `PORT || 3000` returning `200 OK` JSON telemetry (`uptime`, `timer`, `status`), enabling 24/7 hosting on free cloud platforms (Render, Koyeb, Railway).
- 💾 **Dual Storage Engine:** Automatically uses atomic local JSON storage or connects to cloud storage.
- ⚡ **Zero-Lag Architecture:** Minimal CPU and RAM footprint (< 35MB RAM).

---

## 🏗️ Architecture & Keep-Alive Flow

```mermaid
flowchart TD
    subgraph CloudHost ["24/7 Cloud Host (Render / VPS)"]
        HTTP["HTTP Keep-Alive Server (:3000)"]
        Timer["Timer Service (Persistent Timestamp)"]
        Pres["Presence Manager (Streaming Loop)"]
        Voice["Voice Manager (@discordjs/voice)"]
    end

    subgraph ExternalServices ["External Monitoring & Discord"]
        Uptime["UptimeRobot / Cron (Every 5 mins)"]
        Gateway["Discord Gateway v10"]
        VoiceGW["Discord Voice Server (WebSockets & UDP)"]
    end

    Uptime -->|GET / -> 200 OK Status| HTTP
    Timer -->|Computes Cumulative Hours (0h+)| Pres
    Pres -->|Activity: Streaming (Twitch/YouTube)| Gateway
    Voice -->|Voice Channel Lock & Reconnect| VoiceGW
```

---

## ☁️ 24/7 Render Free Cloud Hosting (Step-by-Step)

Follow these simple steps to keep the bot running **24/7 for free without stopping**:

### Step 1: Push / Fork Repository
Make sure this repository is on your GitHub account.

### Step 2: Create a Web Service on Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your `Streaming-bot-discord` repository.
3. Configure the settings:
   - **Name:** `zyro-streaming-bot` (or your preferred name)
   - **Region:** Any (e.g. Oregon, Frankfurt, Singapore)
   - **Branch:** `main`
   - **Root Directory:** *(Leave blank)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### Step 3: Add Environment Variables
Under **Environment Variables**, click **Add Environment Variable**:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `BOT_TOKEN` | `your_bot_token_here` | Discord Bot Token from Developer Portal |
| `DEFAULT_STREAM_URL` | `https://www.twitch.tv/example` | Stream link displayed on profile |
| `BASE_ELAPSED_HOURS` | `0` | Starting hours (default: `0` for unlimited progress) |
| `PORT` | `3000` | HTTP port for Render health check |

Click **Create Web Service**.

### Step 4: Keep It Alive 24/7 (Prevent Render Sleeping)
Render free Web Services sleep after 15 minutes of inactivity. Because our bot includes a built-in HTTP server, we can keep it awake 24/7 using [UptimeRobot](https://uptimerobot.com):

1. Once Render finishes deploying, copy your service URL (e.g., `https://zyro-streaming-bot.onrender.com`).
2. Open [UptimeRobot](https://uptimerobot.com) and create a free account.
3. Click **Add New Monitor**:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Discord Streaming Bot`
   - **URL (or IP):** `https://zyro-streaming-bot.onrender.com`
   - **Monitoring Interval:** `Every 5 minutes`
4. Click **Create Monitor**.

✅ **Done!** UptimeRobot will ping the bot every 5 minutes, returning `200 OK` and preventing Render from ever sleeping. The bot will run **24/7 non-stop**!

---

## 🚀 Local & VPS Deployment

### Local Quick Start
```bash
# 1. Clone repository
git clone https://github.com/thenudasahas2008/Streaming-bot-discord.git
cd Streaming-bot-discord

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in BOT_TOKEN in .env

# 4. Start the bot
npm start
```

### VPS Deployment (Ubuntu / Debian with PM2)
```bash
npm install -g pm2
pm2 start src/index.js --name "streaming-bot"
pm2 startup
pm2 save
```

---

## 🎮 Slash Commands

| Command | Arguments | Permission | Description |
| :--- | :--- | :--- | :--- |
| **`/setvoice`** | `channel` *(Voice)* | `ManageGuild` | Selects and locks the voice channel for the bot to stay in 24/7. |
| **`/setstream`** | `url` *(Twitch/YouTube)* | `ManageGuild` | Updates the global streaming profile link. |
| **`/timer`** | *None* | Everyone | Displays the exact live progressive streaming elapsed time. |
| **`/status`** | *None* | Everyone | Displays current voice connectivity, server stats, and ping. |
| **`/reset`** | `hours` *(Optional)* | `ManageGuild` | Resets or sets the cumulative timer (min: `0`, default: `0`). |

---

## ⚙️ Configuration Reference

| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `BOT_TOKEN` | **Yes** | — | Discord Bot Token from Discord Developer Portal. |
| `DEFAULT_STREAM_URL` | Optional | `""` | Fallback Twitch or YouTube live stream link. |
| `BASE_ELAPSED_HOURS` | Optional | `0` | Starting hours for the timer (default: `0` for fresh start). |
| `PORT` | Optional | `3000` | HTTP port for Render / UptimeRobot health check. |
| `DATA_DIR` | Optional | `./data` | Directory for persistent timer and settings storage. |
| `PRESENCE_UPDATE_INTERVAL_MS`| Optional | `60000` | Frequency of presence activity updates (ms). |

---

## 🔒 Discord Developer Portal Checklist

Ensure the following are enabled at [discord.com/developers/applications](https://discord.com/developers/applications):

1. **Privileged Gateway Intents:**
   - Server Members Intent
   - Voice State & Guild Intents
2. **Bot Permissions:**
   - `View Channels`
   - `Connect`
   - `Speak`
   - `Use Embedded Activities`
   - `Send Messages`
   - `Use Slash Commands`
