NovaTec Business Solutions — Web (Astro)

Sitio corporativo rápido, moderno y SEO-ready construido con Astro 5 + TailwindCSS.
Incluye navbar responsivo con hamburguesa → X, fondo animado de circuito, secciones de Servicios y Clientes.

🧱 Stack

Astro 5 (Island Architecture, astro:assets)

TailwindCSS (estilos utilitarios)

Iconos (opcional):

astro-icon + colecciones Iconify

SVGs inline optimizados (WhatsApp glossy incluido)

Deploy recomendado: Vercel (@astrojs/vercel)

Extras opcionales: @astrojs/sitemap, @astrojs/mdx, @astrojs/rss, GA4


🚀 Quick Start
# Requisitos
```
node -v            # Node 18.17+ o 20+
npm i              # instala dependencias
npm run dev        # arranca el entorno local
```

Build y previsualización:
```
npm run build
npm run preview
```

📁 Estructura del proyecto
```
/
├─ public/
│  ├─ favicon.png
│  └─ (imágenes públicas)
├─ src/
│  ├─ componentes/
│  │  ├─ Navbar.astro        # Navbar moderno + menú móvil animado
│  │  └─ CircuitBG.astro     # Fondo SVG “circuito” animado + parallax
│  ├─ layouts/
│  │  └─ Base.astro          # (si se usa) layout con global.css
│  ├─ pages/
│  │  ├─ index.astro         # Hero + Servicios + Clientes
│  │  ├─ servicios.astro
│  │  ├─ nosotros.astro
│  │  └─ contacto.astro
│  └─ styles/
│     └─ global.css          # @tailwind base; components; utilities
├─ astro.config.mjs
├─ tailwind.config.mjs
├─ postcss.config.cjs
└─ package.json
```


✨ Componentes clave
Navbar.astro

Sticky, fondo con blur, ruta activa subrayada, CTA “Cotizar”.

Menú móvil con animación hamburguesa → X.

Botón flotante de WhatsApp (sólo mobile), con icono glossy.


🔍 SEO / Analytics

@astrojs/sitemap → sitemap.xml automático.

Metadatos en cada página (title/description/og).

GA4 (opcional) vía @astrojs/google-analytics o snippet manual.



☁️ Deploy (Vercel)

Instalar integración (opcional):

```npm i @astrojs/vercel```

```
import vercel from '@astrojs/vercel/serverless';
export default {
  output: 'server',
  adapter: vercel(),
}
```

🤝 Contacto

Sitio: próximamente

WhatsApp: +52 443 393 4469

Email: (agregar)

