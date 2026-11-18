# Flujo de trabajo GEO

Fuente de verdad del flujo de actualización del sitio con GEO
(Generative Engine Optimization). Versión para compartir con Mica:
[pdf/Flujo-GEO-Fiesta-Polenta.pdf](pdf/Flujo-GEO-Fiesta-Polenta.pdf).

Detalle técnico de los archivos generados: ver
[01-proyecto-resumen.md](01-proyecto-resumen.md) y
[04-section-tickets.md](04-section-tickets.md).

## 1. Archivos GEO

-   `llms.txt`, `sitemap.xml` y el bloque JSON-LD de `index.html` (entre
    los marcadores `SEO:JSONLD:START` y `SEO:JSONLD:END`) son archivos
    generados: no se editan a mano.
-   Se generan con `npm run build-seo` a partir de `data/tickets.json`,
    `scripts/seo-config.json` y `scripts/llms.template.txt`.
-   `robots.txt` es estático y no cambia.
-   Si `tickets.json` cambia y no se regeneran, el sitio muestra los tickets
    nuevos pero JSON-LD y `llms.txt` quedan con fechas viejas. Por eso el
    flujo semanal se hace aunque no haya fechas nuevas.

## 2. Responsables

-   **Mica**: imágenes de tickets, `tickets.json` (con campos opcionales),
    aviso de ciudades nuevas, subida por CPanel (administrador de archivos
    de GoDaddy) y verificación del sitio.
-   **Lucas**: ciudades nuevas en `scripts/seo-config.json`, ejecución de
    `npm run build-seo`, entrega de los archivos generados, zip de versiones
    nuevas, validación del JSON-LD y pendientes técnicos.

## 3. Publicación semanal (actualización de fechas)

1.  **Mica**: sube las imágenes de los tickets nuevos y actualiza
    `tickets.json` (`date`, `city`, `alt`, `link` y, si los tiene, `name`,
    `venue`, `address`, `startTime`, `endTime`, `price`, `currency`,
    `type`). Avisa a Lucas, antes de que corra el script, si hay una ciudad
    nueva, y le envía el `tickets.json`.
2.  **Lucas**: si hay ciudad nueva, la suma a `scripts/seo-config.json`.
    Pone el `tickets.json` en una copia equivalente a `branch_deploy` y
    ejecuta `npm run build-seo -- --out seo-out`. Revisa los avisos del
    script y entrega a Mica `index.html`, `llms.txt` y `sitemap.xml`.
3.  **Mica**: sube por CPanel `index.html`, `llms.txt`, `sitemap.xml`,
    `tickets.json` y las imágenes nuevas. No toca `robots.txt`.
4.  **Verificación**:
    -   Mica: recarga fiestapolenta.com sin caché y comprueba que los
        tickets nuevos aparecen con su imagen y su link; abre `/llms.txt`,
        `/sitemap.xml` y `/robots.txt` (sin 404) y verifica que las fechas
        de `llms.txt` coinciden con las del sitio.
    -   Lucas: valida el JSON-LD de la home (Rich Results Test de Google o
        validator.schema.org): sin errores y con un evento por fecha vigente.

## 4. Publicación de versión nueva (cambios complejos o rediseños)

1.  **Lucas**: ejecuta `npm run build-seo` (sin `--out`), arma el zip con
    todo lo necesario y se lo pasa a Mica.
2.  **Mica**: descomprime y pega todo el contenido desde el administrador
    de archivos de CPanel.
3.  **Mica**: verifica que `tickets.json` y las imágenes de tickets no
    hayan quedado pisados por versiones viejas del zip; si es así, los
    actualiza.
4.  **Ambos**: repiten la verificación del paso 4 del flujo semanal.

## 5. Avisos del script

-   «Ciudad no está en `seo-config.json`»: falta cargarla; el evento se
    genera sin ubicación. Se corrige y se vuelve a correr.
-   «Fecha inválida»: debe ser `AAAAMMDD`; la corrige Mica.
-   «Sin link de compra»: falta `link` en esa fecha.
-   «Hay `price` pero no `currency`»: agregar `currency`.

## 6. Pendientes técnicos de Lucas

-   Zona horaria en `tickets.js` (observación en
    [04-section-tickets.md](04-section-tickets.md)). Si la regla de fechas
    cambia en `tickets.js`, debe cambiar igual en `scripts/build-seo.js`.
-   Cargar ciudades nuevas en `scripts/seo-config.json` cuando aparezcan.
-   Imagen Open Graph definitiva (hoy `slider-img-1.png`, provisoria).
-   Los textos fijos de `llms.txt` se editan en `scripts/llms.template.txt`
    y `scripts/seo-config.json`, nunca en `llms.txt`.

## 7. Automatización (en estudio)

Se evalúa automatizar, por ahora en la Mac de Lucas, la generación de
archivos y las validaciones previas y posteriores a la publicación. La
subida al hosting sigue siendo manual. No hay decisión tomada sobre crear un
agente de Fiesta Polenta*; depende de los flujos que defina Maru.
