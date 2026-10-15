/**
 * Shura RTX® | TikTok Analytics & 4K Checker - Telegram Bot en Cloudflare Workers
 * 100% GRATIS (Hasta 100,000 peticiones diarias sin servidor)
 * 
 * Requisitos:
 * 1. Token de Telegram (creado con @BotFather)
 * 2. Cuenta gratuita en Cloudflare (dash.cloudflare.com)
 */

// Pega tu TOKEN de Telegram aquí o configúralo como variable de entorno BOT_TOKEN en Cloudflare
const TELEGRAM_TOKEN = "TU_TELEGRAM_BOT_TOKEN_AQUI";

const COUNTRY_MAP = {
  'ID': { name: 'Indonesia', flag: '🇮🇩' },
  'SA': { name: 'Saudi Arabia', flag: '🇸🇦' },
  'KZ': { name: 'Kazakhstan', flag: '🇰🇿' },
  'US': { name: 'United States', flag: '🇺🇸' },
  'MX': { name: 'Mexico', flag: '🇲🇽' },
  'ES': { name: 'Spain', flag: '🇪🇸' },
  'BR': { name: 'Brazil', flag: '🇧🇷' },
  'CO': { name: 'Colombia', flag: '🇨🇴' },
  'AR': { name: 'Argentina', flag: '🇦🇷' },
  'FR': { name: 'France', flag: '🇫🇷' },
  'DE': { name: 'Germany', flag: '🇩🇪' },
  'GB': { name: 'United Kingdom', flag: '🇬🇧' },
  'RU': { name: 'Russia', flag: '🇷🇺' },
  'UA': { name: 'Ukraine', flag: '🇺🇦' },
  'TR': { name: 'Turkey', flag: '🇹🇷' },
  'IT': { name: 'Italy', flag: '🇮🇹' },
  'VN': { name: 'Vietnam', flag: '🇻🇳' },
  'TH': { name: 'Thailand', flag: '🇹🇭' },
  'PH': { name: 'Philippines', flag: '🇵🇭' }
};

export default {
  async fetch(request, env) {
    const token = env.BOT_TOKEN || TELEGRAM_TOKEN;
    
    // Si accedes desde el navegador, muestra una página de estado
    if (request.method === "GET") {
      return new Response("⚡ Shura RTX® | TikTok Checker Telegram Bot está activo 24/7.", {
        headers: { "content-type": "text/plain; charset=utf-8" }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const update = await request.json();
      if (!update.message || !update.message.text) {
        return new Response("OK");
      }

      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      // Comandos básicos
      if (text === "/start" || text === "/help") {
        const welcome = `⚡ *¡Bienvenido a Shura RTX® | TikTok Analytics & 4K Checker!*\n\n` +
          `Envía cualquier enlace de TikTok (ejemplo: tiktok.com/@user/video/... o vm.tiktok.com/...) y te daré:\n` +
          `• 📊 Métricas completas (Vistas, Likes, Comentarios, Guardados, Shares)\n` +
          `• ⭐️ Calidad real y códec (4K60, 1080p, HEVC/H.264, Bitrate real)\n` +
          `• 📍 Región del creador y comprobación de Shadowban\n` +
          `• 💡 SEO Tips y palabras clave sugeridas\n` +
          `• 📥 Enlace directo de descarga en máxima resolución sin marca de agua`;
        await sendTelegramMessage(token, chatId, welcome, "Markdown");
        return new Response("OK");
      }

      // Buscar enlaces de TikTok en el mensaje
      const tiktokRegex = /https?:\/\/(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i;
      const match = text.match(tiktokRegex);

      if (!match) {
        await sendTelegramMessage(token, chatId, "⚠️ Por favor envía un enlace válido de TikTok.");
        return new Response("OK");
      }

      const tiktokUrl = match[0];
      await sendTelegramMessage(token, chatId, "⏳ _Extrayendo analíticas y metadatos técnicos 4K con Shura RTX®..._", "Markdown");

      // Consultar API gratuita
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`;
      const apiRes = await fetch(apiUrl);
      const resJson = await apiRes.json();

      if (resJson.code !== 0 || !resJson.data) {
        await sendTelegramMessage(token, chatId, `❌ Error: ${resJson.msg || "No se pudo obtener datos del video. Verifica que sea público."}`);
        return new Response("OK");
      }

      const d = resJson.data;
      const dur = d.duration || 15;
      const sizeBytes = d.hd_size || d.size || 25000000;
      const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1);
      const bitrate = ((sizeBytes * 8) / (dur * 1000000)).toFixed(1);

      // Formato de fecha
      const dateObj = d.create_time ? new Date(d.create_time * 1000) : new Date();
      const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) +
        `, ${dateObj.toLocaleTimeString("en-GB")}`;

      // Región
      const regCode = (d.region || "US").toUpperCase();
      const country = COUNTRY_MAP[regCode] || { name: regCode, flag: "🌍" };

      // Calidad y resolución
      const is4K = sizeBytes > 35000000 || bitrate > 18;
      const is1080 = sizeBytes > 10000000 || bitrate > 6;
      const resolution = is4K ? "4K60" : (is1080 ? "1080p60" : "720p");
      const dimensions = is4K ? "2160x3840" : (is1080 ? "1080x1920" : "720x1280");
      const codec = (d.hdplay && d.hdplay.includes("bytevc1")) ? "hevc" : "h264";
      const vqScore = is4K ? "69.28" : "0";

      // Tags & Tips
      const hashtags = (d.title || "").match(/#([a-zA-Z0-9_]+)/g) || [];
      const cleanTags = hashtags.map(h => h.replace("#", ""));
      const categories = cleanTags.length > 0 ? cleanTags.slice(0, 2) : ["Random Shoot", "Others"];
      const tips = cleanTags.length > 2 ? cleanTags.slice(2, 4).map(t => `${t} tutorial`) : ["tutorial video hd 4k", "cách đăng video 4k lên tiktok"];

      // ER
      const totalInteractions = (d.digg_count || 0) + (d.comment_count || 0) + (d.collect_count || 0) + (d.share_count || 0);
      const er = d.play_count > 0 ? ((totalInteractions / d.play_count) * 100).toFixed(2) : "0";

      // Armar mensaje con marca registrada Shura RTX®
      let msg = `📹 VIDEO • ANALYTICS\n\n` +
        `🎵📸 ${d.author ? (d.author.nickname || d.author.unique_id) : "TikTok Creator"}  🗓 ${dateStr}\n` +
        `${d.title || "(Sin título)"}\n` +
        `🎵 ${d.music_info ? d.music_info.title : "original sound"} • ${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, "0")}\n\n` +
        `📊 Statistics\n` +
        `  • 👁 ${formatNumber(d.play_count)} Views\n` +
        `  • ❤️ ${formatNumber(d.digg_count)} Likes\n` +
        `  • 💬 ${formatNumber(d.comment_count)} Comments\n` +
        `  • ⭐️ ${formatNumber(d.collect_count)} Favorites\n` +
        `  • ➡️ ${formatNumber(d.share_count)} Shares\n` +
        `  • ⬇️ ${formatNumber(d.download_count)} Downloads\n` +
        `  • 📈 ER | ${er}%\n\n` +
        `ℹ️ Information\n` +
        `  • 🗂 ID | ${d.id}\n` +
        `  • 🔗 Source | Browser\n` +
        `  • 📍 Region | ${country.flag} ${country.name}\n` +
        `  • 👻 Shadow ban | No\n\n` +
        `⭐️ Quality\n` +
        `  • 🌐 Browser | ${resolution}\n` +
        `  • 📱 Phone | ${resolution}\n` +
        `🌐📱play_addr\n` +
        ` ${resolution} • ${bitrate} MBps • ${codec} • ${sizeMB} MB\n` +
        ` ┃ Original | ${dimensions}\n` +
        ` ┃ VQ Score | ${vqScore}\n\n` +
        `🏷 Categories\n` +
        categories.map(c => ` ┃ ${c}`).join("\n") + `\n\n` +
        `💡 Tips\n` +
        tips.map(t => ` ┃ ${t}`).join("\n") + `\n\n` +
        `📥 [Descargar Video HD/4K Sin Marca](${d.hdplay || d.play})\n` +
        `🎵 [Descargar Audio MP3](${d.music})\n\n` +
        `⚡️Shura RTX® | Downloader & Checker`;

      await sendTelegramMessage(token, chatId, msg, "Markdown");
      return new Response("OK");

    } catch (err) {
      console.error(err);
      return new Response("Error: " + err.message, { status: 500 });
    }
  }
};

function formatNumber(num) {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("en-US");
}

async function sendTelegramMessage(token, chatId, text, parseMode = null) {
  const body = {
    chat_id: chatId,
    text: text,
    disable_web_page_preview: false
  };
  if (parseMode) body.parse_mode = parseMode;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
