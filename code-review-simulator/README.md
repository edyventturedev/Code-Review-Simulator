# Code Review Simulator

Herramienta de revisión de código con IA (Claude). El front-end nunca habla
directamente con la API de Anthropic — llama a una función serverless propia
(`/api/review`) que guarda la API key de forma segura en el servidor.

```
code-review-simulator/
├── index.html        ← UI (igual diseño, llama a /api/review)
├── api/
│   └── review.js      ← función serverless, aquí vive la API key (vía env var)
└── vercel.json         ← config mínima
```

## Despliegue en Vercel

1. **Crea el repo en GitHub** y sube esta carpeta completa (manteniendo la
   estructura de carpetas, especialmente `api/review.js`).

2. **Entra a [vercel.com](https://vercel.com)** e inicia sesión con tu cuenta
   de GitHub.

3. **"Add New" → "Project"** y selecciona el repo que acabas de subir.
   Vercel detecta automáticamente que es un proyecto estático con una función
   serverless en `/api`. No necesitas tocar el "Build Command" ni el "Output
   Directory".

4. **Antes de hacer el primer deploy** (o después, en Settings), agrega la
   variable de entorno:
   - Ve a **Project Settings → Environment Variables**
   - Nombre: `ANTHROPIC_API_KEY`
   - Valor: tu API key de Anthropic (la consigues en
     [console.anthropic.com](https://console.anthropic.com))
   - Aplícala a los tres entornos (Production, Preview, Development)

5. **Deploy.** Vercel te da una URL tipo `https://code-review-simulator.vercel.app`.

6. Prueba: pega código, da clic en "Run review". Ahora la petición va a
   `tu-dominio.vercel.app/api/review`, que internamente llama a Anthropic con
   tu key — el navegador nunca la ve.

## ¿Por qué no funcionaba en GitHub Pages?

GitHub Pages solo sirve archivos estáticos (HTML/CSS/JS), no puede ejecutar
código de servidor. Por eso el `fetch` directo a `api.anthropic.com` desde el
navegador fallaba: la API de Anthropic no acepta llamadas hechas directamente
desde el cliente (y tampoco deberías poner tu API key en el HTML, ya que
cualquiera podría verla y usarla). Vercel sí permite correr la función
`api/review.js` en su servidor, que es donde debe vivir la API key.

## Desarrollo local (opcional)

Si quieres probarlo en tu máquina antes de subirlo:

```bash
npm install -g vercel
vercel dev
```

Esto levanta tanto el HTML como la función serverless en `localhost`, leyendo
la variable de entorno desde un archivo `.env.local` (no lo subas a GitHub):

```
ANTHROPIC_API_KEY=sk-ant-...
```

## Notas

- El límite de tamaño de snippet está en ~12,000 caracteres (puedes ajustarlo
  en `api/review.js`) para evitar abuso.
- Si quieres limitar quién puede usar el endpoint (por ejemplo, para que no
  cualquiera gaste tu cuota de API), puedes agregar rate limiting o un check
  de origen (`req.headers.origin`) dentro de `api/review.js`.
