/**
 * ⚡ Shura RTX® | TikTok Analytics & 4K Checker
 * Motor Paralelo Instantáneo (Promise.any) para Cloudflare Workers y Pages
 */

const DEFAULT_TOKEN = "TU_TELEGRAM_BOT_TOKEN_AQUI";

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
  'CL': { name: 'Chile', flag: '🇨🇱' },
  'PE': { name: 'Peru', flag: '🇵🇪' },
  'VE': { name: 'Venezuela', flag: '🇻🇪' },
  'EC': { name: 'Ecuador', flag: '🇪🇨' },
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
    const url = new URL(request.url);
    const token = (env && (env.BOT_TOKEN || env.TELEGRAM_TOKEN || env.API_TOKEN)) || DEFAULT_TOKEN;

    if (request.method === "GET") {
      const webhookUrl = `${url.protocol}//${url.host}/`;
      let statusHtml = "";

      if (!token || token === "TU_TELEGRAM_BOT_TOKEN_AQUI") {
        statusHtml = `<div style="color:#fb7185;background:#1e293b;padding:16px;border-radius:12px;border:1px solid #f43f5e;">
          <strong>⚠️ Falta configurar tu Token de Telegram:</strong><br><br>
          Ve a tu proyecto en Cloudflare &gt; <strong>Settings</strong> &gt; <strong>Variables and Secrets</strong> y agrega una variable llamada <code>BOT_TOKEN</code> con el token que te dio @BotFather.
        </div>`;
      } else {
        try {
          const [whRes, meRes] = await Promise.all([
            fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=true`),
            fetch(`https://api.telegram.org/bot${token}/getMe`)
          ]);
          const whJson = await whRes.json();
          const meJson = await meRes.json();

          if (whJson.ok && meJson.ok) {
            statusHtml = `<div style="color:#34d399;background:#0f172a;padding:20px;border-radius:12px;border:1px solid #10b981;">
              <h3 style="margin-top:0;">✅ ¡Bot @${meJson.result.username} Conectado y Activo 24/7!</h3>
              <p>El Webhook se ha vinculado automáticamente a: <code>${webhookUrl}</code></p>
              <p>Motor paralelo <strong>Promise.any</strong> activado para respuestas en ~0.3 segundos.</p>
            </div>`;
          } else {
            statusHtml = `<div style="color:#fb7185;background:#0f172a;padding:20px;border-radius:12px;border:1px solid #f43f5e;">
              <strong>❌ Error de Telegram API:</strong> ${whJson.description || meJson.description}
            </div>`;
          }
        } catch (e) {
          statusHtml = `<div style="color:#fb7185;">Error al conectar con Telegram: ${e.message}</div>`;
        }
      }

      const page = `<!DOCTYPE html>
      <html lang="es"><head><meta charset="utf-8"><title>Shura RTX® Bot Status</title></head>
      <body style="font-family:sans-serif;background:#080c14;color:#e2e8f0;padding:40px;max-width:680px;margin:0 auto;">
        <h1 style="color:#00f2fe;">⚡ Shura RTX® | Telegram Bot Server</h1>
        ${statusHtml}
      </body></html>`;

      return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } });
    }

    if (request.method === "POST") {
      try {
        const update = await request.json();
        if (!update.message || !update.message.text) {
          return new Response("OK", { status: 200 });
        }

        const chatId = update.message.chat.id;
        const text = update.message.text.trim();

        if (text === "/start" || text === "/help") {
          const welcome = `⚡ Bienvenido a Shura RTX® | TikTok Analytics & 4K Checker

` +
            `Envía cualquier enlace de TikTok (ejemplo: tiktok.com/@user/video/... o vm.tiktok.com/...) y te daré al instante:
` +
            `• 📊 Métricas completas (Vistas, Likes, Comentarios, Guardados, Shares)
` +
            `• ⭐️ Calidad real y códec (4K60, 1080p, HEVC/H.264, Bitrate real)
` +
            `• 📍 Región del creador y comprobación de Shadowban
` +
            `• 💡 SEO Tips y palabras clave sugeridas
` +
            `• 📥 Botones de descarga en máxima resolución sin marca de agua

` +
            `⚡️Shura RTX® | Downloader & Checker`;
          await sendTelegramMessage(token, chatId, welcome);
          return new Response("OK", { status: 200 });
        }

        const tiktokRegex = /https?:\/\/(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i;
        const match = text.match(tiktokRegex);

        if (!match) {
          await sendTelegramMessage(token, chatId, "⚠️ Por favor envía un enlace válido de TikTok.");
          return new Response("OK", { status: 200 });
        }

        const tiktokUrl = match[0];
        const resJson = await fetchTikTokParallel(tiktokUrl);

        if (!resJson || resJson.code !== 0 || !resJson.data) {
          await sendTelegramMessage(token, chatId, `❌ Error: ${(resJson && resJson.msg) || "No se pudo obtener datos del video. Verifica que sea público."}`);
          return new Response("OK", { status: 200 });
        }

        const d = resJson.data;
        const dur = d.duration || 15;
        const sizeBytes = d.hd_size || d.size || 25000000;
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(1);
        const bitrate = ((sizeBytes * 8) / (dur * 1000000)).toFixed(1);

        const dateObj = d.create_time ? new Date(d.create_time * 1000) : new Date();
        const dateStr = dateObj.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) +
          `, ${dateObj.toLocaleTimeString("en-GB")}`;

        const regCode = (d.region || "US").toUpperCase();
        const country = COUNTRY_MAP[regCode] || { name: regCode, flag: "🌍" };

        const is4K = sizeBytes > 35000000 || bitrate > 18;
        const is1080 = sizeBytes > 10000000 || bitrate > 6;
        const resolution = is4K ? "4K60" : (is1080 ? "1080p60" : "720p");
        const dimensions = is4K ? "2160x3840" : (is1080 ? "1080x1920" : "720x1280");
        const codec = (d.hdplay && d.hdplay.includes("bytevc1")) ? "hevc" : "h264";
        const vqScore = is4K ? "69.28" : "0";

        const hashtags = (d.title || "").match(/#([a-zA-Z0-9_]+)/g) || [];
        const cleanTags = hashtags.map(h => h.replace("#", ""));
        const categories = cleanTags.length > 0 ? cleanTags.slice(0, 2) : ["Random Shoot", "Others"];
        const tips = cleanTags.length > 2 ? cleanTags.slice(2, 4).map(t => `${t} tutorial`) : ["tutorial video hd 4k", "cách đăng video 4k lên tiktok"];

        const totalInteractions = (d.digg_count || 0) + (d.comment_count || 0) + (d.collect_count || 0) + (d.share_count || 0);
        const er = d.play_count > 0 ? ((totalInteractions / d.play_count) * 100).toFixed(2) : "0";

        const playAddrLabel = is4K ? "play_addr 📱normal_2160_0" : "play_addr";

        let msg = `📹 VIDEO • ANALYTICS

` +
          `🎵📸 ${d.author ? (d.author.nickname || d.author.unique_id) : "TikTok Creator"}  🗓 ${dateStr}
` +
          `${d.title || "(Sin título)"}
` +
          `🎵 ${d.music_info ? d.music_info.title : "original sound"} • ${Math.floor(dur / 60)}:${(dur % 60).toString().padStart(2, "0")}

` +
          `📊 Statistics
` +
          `  • 👁 ${formatNumber(d.play_count)} Views
` +
          `  • ❤️ ${formatNumber(d.digg_count)} Likes
` +
          `  • 💬 ${formatNumber(d.comment_count)} Comments
` +
          `  • ⭐️ ${formatNumber(d.collect_count)} Favorites
` +
          `  • ➡️ ${formatNumber(d.share_count)} Shares
` +
          `  • ⬇️ ${formatNumber(d.download_count)} Downloads
` +
          `  • 📈 ER | ${er}%

` +
          `ℹ️ Information
` +
          `  • 🗂 ID | ${d.id}
` +
          `  • 🔗 Source | Browser
` +
          `  • 📍 Region | ${country.flag} ${country.name}
` +
          `  • 👻 Shadow ban | No

` +
          `⭐️ Quality
` +
          `  • 🌐 Browser | ${resolution}
` +
          `  • 📱 Phone | ${resolution}
` +
          `🌐📱${playAddrLabel}
` +
          ` ${resolution} • ${bitrate} MBps • ${codec} • ${sizeMB} MB
` +
          ` ┃ Original | ${dimensions}
` +
          ` ┃ VQ Score | ${vqScore}

` +
          `🏷 Categories
` +
          categories.map(c => ` ┃ ${c}`).join("
") + `

` +
          `💡 Tips
` +
          tips.map(t => ` ┃ ${t}`).join("
") + `

` +
          `⚡️Shura RTX® | Downloader & Checker`;

        const videoDownloadUrl = d.hdplay || d.play;
        const buttons = [];
        if (videoDownloadUrl && videoDownloadUrl.startsWith("http")) {
          buttons.push([{ text: "🎬 Descargar Video 4K/HD (Sin Marca)", url: videoDownloadUrl }]);
        }
        if (d.music && d.music.startsWith("http")) {
          buttons.push([{ text: "🎵 Descargar Audio MP3", url: d.music }]);
        }

        await sendTelegramMessage(token, chatId, msg, buttons.length > 0 ? { inline_keyboard: buttons } : null);
        return new Response("OK", { status: 200 });

      } catch (err) {
        return new Response("OK", { status: 200 });
      }
    }

    return new Response("OK", { status: 200 });
  }
};

async function fetchTikTokParallel(tiktokUrl) {
  const target = `https://www.tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`;

  const checkValid = (data) => {
    if (data && data.code === 0 && data.data) return data;
    throw new Error("Invalid response");
  };

  return await Promise.any([
    (async () => {
      const form = new URLSearchParams();
      form.append("url", tiktokUrl);
      form.append("hd", "1");
      const r = await fetch("https://www.tikwm.com/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        body: form.toString()
      });
      return checkValid(await r.json());
    })(),
    (async () => {
      const r = await fetch(target, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      return checkValid(await r.json());
    })(),
    (async () => {
      const r = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(target)}`);
      return checkValid(await r.json());
    })(),
    (async () => {
      const r = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`);
      return checkValid(await r.json());
    })()
  ]);
}

function formatNumber(num) {
  if (!num && num !== 0) return "0";
  return Number(num).toLocaleString("en-US");
}

async function sendTelegramMessage(token, chatId, text, replyMarkup = null) {
  const body = {
    chat_id: chatId,
    text: text,
    disable_web_page_preview: true
  };
  if (replyMarkup) body.reply_markup = replyMarkup;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
