# 🎙️ ZYRO 24/7 Discord Streaming Bot (සිංහල මාර්ගෝපදේශය)

මෙම Bot මඟින් ඔබගේ Discord Bot Profile එකෙහි **"Streaming"** status එක පැය 24 පුරාම (24/7) නොනවත්වා පවත්වාගෙන යන අතර, ඔබ කැමති Voice Channel එකකට ස්ථිරවම සම්බන්ධ වී (Pinned Voice) රැඳී සිටියි.

---

## ⏱️ Unlimited Live Streaming Timer (0 සිට අසීමිතව ගණනය වීම)

* **0 සිට ආරම්භ වීම:** පෙර පැවති 5,000 පැය සීමාව ඉවත් කර ඇති අතර, Bot server එකට add කළ විගස `0h 00m` සිට ක්‍රමානුකූලව `1h`, `10h`, `100h`, `1000h+` ලෙස අසීමිතව ඉදිරියට ගණනය වේ.
* **Profile Presence Live Update:** Discord Profile එකේ dynamic ලෙස දිස්වේ:
  `🟣 Streaming: 5h 20m elapsed`
* **Restart වුණත් Timer එක Reset නොවීම:** Bot host එක restart වුවද timer එක නැවත 0 හෝ 5000 බවට පත් නොවේ. ආරම්භක වේලාව `data/timer-state.json` හි සුරැකී ඇති බැවින් එතැන් සිට ඉදිරියටම ගණනය වේ.
* **කැමති අගයකින් පටන් ගැනීම:** ඔබට අවශ්‍ය නම් `/reset hours:100` මඟින් ඕනෑම පැය ගණනකින් timer එක නැවත පටන් ගත හැක.

---

## ☁️ Render එකේ නොනවත්වා 24/7 Host කරන ආකාරය (100% Free)

Render free tier එකෙහි server එකක් නොමැතිව web service එකක් මඟින් bot 24/7 run කරගන්නා ආකාරය:

### පියවර 1: GitHub Repository එක සූදානම් කරගැනීම
මෙම repository එක ඔබගේ GitHub ගිණුමට Fork කරගන්න (හෝ Push කරන්න).

### පියවර 2: Render හි New Web Service එකක් සෑදීම
1. [dashboard.render.com](https://dashboard.render.com) වෙත ගොස් **New +** → **Web Service** තෝරන්න.
2. ඔබගේ `Streaming-bot-discord` repository එක connect කරන්න.
3. සැකසුම් (Settings):
   - **Name:** `zyro-streaming-bot`
   - **Branch:** `main`
   - **Root Directory:** *(හිස්ව තබන්න)*
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

### පියවර 3: Environment Variables ඇතුළත් කිරීම
**Environment Variables** යටතේ පහත දෑ ඇතුළත් කරන්න:
- `BOT_TOKEN`: ඔබගේ Discord Bot Token එක ([Discord Developer Portal](https://discord.com/developers/applications) එකෙන් ලබාගන්න).
- `DEFAULT_STREAM_URL`: `https://www.twitch.tv/example` (Bot profile එකේ පෙන්විය යුතු Twitch හෝ YouTube link එක).
- `BASE_ELAPSED_HOURS`: `0` (0 සිට පටන් ගැනීමට).
- `PORT`: `3000` (Render health check එක සඳහා).

**Create Web Service** ක්ලික් කර deploy වීමට ඉඩ දෙන්න.

### පියවර 4: UptimeRobot මඟින් 24/7 Activeව තබාගැනීම
Render Free tier එක විනාඩි 15කින් sleep (inactive) වේ. අපගේ bot තුළ **Built-in HTTP Server** එකක් අඩංගු කර ඇති නිසා UptimeRobot මඟින් පහසුවෙන්ම 24/7 run කරගත හැක:

1. Render deploy වූ පසු ලැබෙන URL එක (උදා: `https://zyro-streaming-bot.onrender.com`) copy කරගන්න.
2. [UptimeRobot.com](https://uptimerobot.com) වෙත ගොස් නොමිලේ ගිණුමක් සාදන්න.
3. **Add New Monitor** ක්ලික් කරන්න:
   - **Monitor Type:** `HTTP(s)`
   - **Friendly Name:** `Discord Streaming Bot`
   - **URL:** `https://zyro-streaming-bot.onrender.com`
   - **Monitoring Interval:** `Every 5 minutes`
4. **Create Monitor** ක්ලික් කරන්න.

✅ දැන් UptimeRobot මඟින් සෑම විනාඩි 5කට වරක් Bot වෙත ping කරන බැවින් Render කිසිදා sleep නොවේ. Bot 24/7 නොනවත්වා ක්‍රියාත්මක වේ!

---

## 🎮 Slash Commands

| Command | විස්තරය | අවසර (Permissions) |
| :--- | :--- | :--- |
| **`/setvoice channel:#voice`** | Bot ස්ථිරවම රැඳී සිටිය යුතු Voice Channel එක තෝරන්න. | Manage Server |
| **`/setstream url:https://...`**| Bot profile එකේ පෙන්වන Streaming Link එක සකසන්න. | Manage Server |
| **`/timer`** | Bot එකේ සජීවී 24/7 streaming කාලය පරීක්ෂා කරන්න. | Everyone |
| **`/status`** | Voice connection, latency සහ ping තත්ත්වය බලන්න. | Everyone |
| **`/reset hours:0`** | Timer එක නව අගයකින් නැවත ආරම්භ කරන්න (Default: 0). | Manage Server |

---

## 🔒 Discord Developer Portal සැකසුම්

Bot සාදන විට පහත Privileged Intents සක්‍රීය (Enable) කර ඇති බව තහවුරු කරගන්න:
- **Server Members Intent**
- **Message Content Intent** (හෝ Voice State Intent)

Bot Invite Link එක සෑදීමේදී `bot` සහ `applications.commands` scopes තෝරා `Connect`, `Speak`, `Use Embedded Activities` අවසර ලබාදෙන්න.
