# ⚡️ Shura RTX® | TikTok Analytics & 4K Checker (Bot de Telegram & Web 100% Gratis)

Este proyecto oficial de **Shura RTX®** te proporciona tanto un **Bot de Telegram** como una **Web interactiva** alojables **100% GRATIS** (sin tarjetas de crédito, sin servidores de pago y con disponibilidad 24/7).

Extrae todos los metadatos técnicos bajo el sello **⚡️Shura RTX® | Downloader & Checker**:
* 📊 **Estadísticas**: Vistas, Likes, Comentarios, Guardados en favoritos, Compartidos, Descargas.
* ℹ️ **Información**: ID del video, Dispositivo/Origen (Browser/App), Región/País del creador con bandera, Verificación de Shadowban.
* ⭐️ **Calidad y Streams Técnicos**: Resolución en navegador y móvil (4K60, 1080p60, etc.), Bitrate real (MBps), Códec de compresión (HEVC / H.264), Tamaño real en MB, Dimensiones originales (ej. 2160x3840), VQ Score.
* 🏷 **Categorías**: Clasificación interna de contenido.
* 💡 **Tips / Sugerencias**: Términos de búsqueda relacionados y recomendaciones SEO de TikTok.
* 📈 **Métricas Pro Extra**: Tasa de interacción (ER%), enlaces de descarga de video en 4K/HD sin marca de agua y audio MP3 original.

---

## 🚀 OPCIÓN 1: Publicar la WEB en GitHub Pages (2 Minutos, Gratis)

1. En GitHub, crea un nuevo repositorio llamado por ejemplo `shura-rtx-checker`.
2. Sube el archivo `tiktok_analytics_app.html` pero **renómbralo como `index.html`**.
3. En tu repositorio de GitHub, haz clic en **Settings** (Configuración) > **Pages**.
4. En **Build and deployment > Source**, selecciona **Deploy from a branch** y elige la rama `main` (carpeta `/root`).
5. Haz clic en **Save**. En 1 minuto tendrás tu web funcionando gratis en:
   `https://tu-usuario.github.io/shura-rtx-checker/`

---

## 🤖 OPCIÓN 2: Desplegar el BOT de Telegram en Cloudflare Workers (Gratis 24/7)

Cloudflare Workers ofrece **100,000 peticiones diarias gratis para siempre**, sin necesidad de tener tu ordenador encendido ni pagar un VPS.

### Paso 1: Crear tu Bot en Telegram
1. Abre Telegram y busca a `@BotFather`.
2. Envía el comando `/newbot`.
3. Elige un nombre (ej. `Shura RTX Checker`) y un usuario que termine en `bot` (ej. `shura_rtx_bot`).
4. Guarda el **Token HTTP API** que te entrega (algo como `7123456789:AAFxxx...`).

### Paso 2: Crear el Worker en Cloudflare
1. Regístrate gratis en [dash.cloudflare.com](https://dash.cloudflare.com/) (no pide tarjeta).
2. En el menú izquierdo ve a **Workers & Pages** > **Create application** > **Create Worker**.
3. Ponle un nombre (ej. `shura-rtx-bot`) y pulsa **Deploy**.
4. Haz clic en **Edit code** (Editar código).
5. Borra todo el código que aparece y pega el contenido del archivo `worker.js`.
6. En la línea `const TELEGRAM_TOKEN = "TU_TELEGRAM_BOT_TOKEN_AQUI";`, pon el token de tu bot (o añádelo en las variables de entorno del Worker con el nombre `BOT_TOKEN`).
7. Haz clic en **Save and Deploy**. Copia la URL de tu Worker (ej. `https://shura-rtx-bot.tu-subdominio.workers.dev`).

### Paso 3: Conectar el Bot con Telegram (Activar Webhook)
Abre cualquier navegador web y entra a esta URL (sustituyendo tu Token y tu URL de Cloudflare):
```
https://api.telegram.org/botTU_TOKEN_DE_TELEGRAM/setWebhook?url=https://shura-rtx-bot.tu-subdominio.workers.dev
```
Si todo es correcto, verás:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```
¡Listo! Ve a tu bot en Telegram, dale a `/start` o envíale cualquier link de TikTok y responderá al instante con tu firma **⚡️Shura RTX® | Downloader & Checker**.

---

## 🐍 OPCIÓN 3: Ejecutar el Bot en Python (Local o VPS)

Si prefieres usar Python tradicional:
1. Instala dependencias:
   ```bash
   pip install pyTelegramBotAPI requests
   ```
2. Edita `bot.py` y coloca tu `BOT_TOKEN`.
3. Ejecuta:
   ```bash
   python bot.py
   ```
