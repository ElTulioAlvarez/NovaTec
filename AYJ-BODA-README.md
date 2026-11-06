# Aranza & Bladimir · Invitación digital

Ruta pública prevista: **https://neotecmx.com/AyJ-Boda**

## Integración

Esta entrega contiene el proyecto Astro **completo** recibido en el ZIP de origen. La invitación tiene su propia página, CSS y JavaScript; no comparte el diseño, la cabecera ni el pie corporativo.

Archivos nuevos:

- `src/pages/AyJ-Boda.astro` — estructura, contenido y metadatos sociales de la invitación.
- `src/styles/ayj-boda.css` — estilos y responsive específicos, sin tocar `global.css`.
- `src/scripts/ayj-boda.ts` — apertura, audio, cuenta regresiva, animaciones y compartir.
- `public/boda/{1,2,3}.webp` — copias optimizadas de las tres fotos originales, conservando los JPEG.
- `public/boda/naima.m4a` — copia remultiplexada **sin recodificar** del archivo suministrado. El archivo de origen tenía extensión `.mp3` pero internamente era AAC/MP4.
- `public/boda/ayj-og.jpg` — imagen social 1200 × 630, utilizada para WhatsApp y Open Graph.
- `public/boda/favicon.svg` — icono independiente de NeoTec.
- `public/boda/Aranza-y-Bladimir.ics` — evento de día completo para reservar el 30/01/2027. Los horarios de ceremonia y recepción están en su descripción; no se inventó hora de finalización.

Configuración y ajustes de metadatos existentes:

- `astro.config.mjs`: `site` ahora apunta a `https://neotecmx.com`.
- `src/lib/seo.ts`: corrige dominio de ejemplo y nombre corporativo.
- `src/pages/index.astro`: usa el mismo dominio canónico **sin `www`**. No se modificó el contenido visible ni el diseño de la página corporativa.

## Ejecutar localmente

```bash
npm ci
npm run dev
```

Abrir `http://localhost:4321/AyJ-Boda`. Para publicar:

```bash
npm run build
```

Desplegar en la configuración actual de Astro + Vercel; verificar que `neotecmx.com` esté asociado al despliegue y que la URL real conserve las mayúsculas de `/AyJ-Boda`.

**Nota de pruebas:** en el entorno donde se creó esta entrega npm no pudo completar `npm ci` por falta de resolución de `registry.npmjs.org` (`EAI_AGAIN`). Por ese motivo **no se pudo ejecutar una compilación Astro real**. Se verificó el TypeScript de la invitación, se inspeccionaron los assets y se efectuó una prueba de interfaz sin backend mediante Chromium para móvil, tablet y escritorio. Antes de desplegar, ejecutar `npm ci && npm run build` en un entorno conectado.

## Información configurada

- Aranza Alejandra Rovira Fierro y José Bladimir Barrientos Vinalay.
- Sábado 30 de enero de 2027.
- Ceremonia 5:30 p. m., recepción 6:30 p. m.
- Jardín Los Olivos, Cam. al Edén, Tenencia Morelos, 58341 Morelos, Mich., México.
- Formal de noche: caballeros traje negro; damas vestido largo en tonos pastel **excepto rosa**.

La cuenta regresiva usa `2027-01-30T17:30:00-06:00`: no depende de la zona horaria del visitante. Música con volumen suave y activación posterior a un gesto del usuario, para cumplir las restricciones de reproducción automática de los navegadores. Funciona con preferencia de movimiento reducido.

**Pendiente antes de compartir:** si se requiere confirmación de asistencia (RSVP) hay que proporcionar medio de contacto, formulario o número autorizado. No se incluyó un formulario ficticio.

**Derechos del audio:** `Naima` (grabación remasterizada suministrada) está sujeta a derechos de la grabación. Confirmar que se cuenta con licencia para alojarla y reproducirla públicamente; alternativamente, reemplazar `public/boda/naima.m4a` por una grabación con derechos autorizados.

**Privacidad:** la invitación se comparte por enlace e incluye los nombres y horarios; se agregó `robots: noindex, nofollow` para desincentivar su indexación por buscadores, pero esto **no convierte el enlace en privado**. No hay analíticas ni formularios que recopilen datos personales.
