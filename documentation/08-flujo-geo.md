# Flujo de trabajo GEO

Fuente de verdad del flujo de actualización del sitio con GEO
(Generative Engine Optimization), incluidos los comandos que lo automatizan
en la Mac de Lucas.

El PDF [pdf/Flujo-GEO-Fiesta-Polenta.pdf](pdf/Flujo-GEO-Fiesta-Polenta.pdf)
(versión para compartir con Mica, del 23-11-2026) resume este flujo con los
comandos `geo:*`. Ante cualquier diferencia, rige este documento.

Detalle técnico de los archivos generados: ver
[01-proyecto-resumen.md](01-proyecto-resumen.md) y
[04-section-tickets.md](04-section-tickets.md).

## 1. Archivos GEO

-   `llms.txt`, `sitemap.xml` y el bloque JSON-LD de `index.html` (entre
    los marcadores `SEO:JSONLD:START` y `SEO:JSONLD:END`) son archivos
    generados: no se editan a mano.
-   Se generan con `scripts/build-seo.js` (`npm run build-seo`) a partir de
    `data/tickets.json`, `scripts/seo-config.json` y
    `scripts/llms.template.txt`. Los comandos `geo:*` de este documento lo
    usan; normalmente no se corre `build-seo` directamente.
-   `robots.txt` es estático y no cambia.
-   Si `tickets.json` cambia y no se regeneran, el sitio muestra los tickets
    nuevos pero JSON-LD y `llms.txt` quedan con fechas viejas. Por eso el
    flujo semanal se hace aunque no haya fechas nuevas.
-   Las salidas de los comandos se guardan en `entrega-geo/` y en `seo-out/`,
    carpetas ignoradas por git (`.gitignore`).

## 2. Responsables

-   **Mica**: imágenes de tickets, `tickets.json` (con campos opcionales),
    aviso de ciudades nuevas, subida por CPanel (administrador de archivos
    de GoDaddy) y verificación del sitio.
-   **Lucas**: ciudades nuevas en `scripts/seo-config.json`, ejecución de los
    comandos `geo:*`, entrega de los archivos generados, validación del
    JSON-LD y pendientes técnicos.

## 3. Comandos

Se ejecutan desde la raíz del proyecto con `npm run <comando>`. Las opciones
se pasan después de `--`. Los scripts están en `scripts/geo/` y no tienen
dependencias externas (solo Node 18 o superior; `geo:zip` usa además el
comando `zip` de macOS).

| Comando | Qué hace | Escribe |
| --- | --- | --- |
| `geo:validar` | Valida un `tickets.json` antes de generar. | Nada. |
| `geo:ciudad` | Agrega ciudades (y países) nuevos a `seo-config.json`. | `scripts/seo-config.json`, solo con confirmación. |
| `geo:preparar` | Valida, genera los archivos y arma la entrega semanal para Mica. | `entrega-geo/AAAAMMDD-HHMM/`. |
| `geo:zip` | Arma el zip de una versión nueva del sitio. | `index.html`, `llms.txt` y `sitemap.xml` del proyecto (vía `build-seo`) y `entrega-geo/polenta-web-AAAAMMDD-HHMM.zip`. |
| `geo:verificar` | Verifica el sitio publicado. | Nada. |

Todos los comandos que leen el `tickets.json` nuevo (`geo:validar`,
`geo:ciudad`, `geo:preparar`) lo buscan por defecto en
`~/Downloads/tickets.json`; con `--tickets <ruta>` se indica otro. El
`tickets.json` nuevo no se pega en `data/tickets.json` antes de validarlo:
así el proyecto nunca queda con un archivo inválido. Si en Descargas no
está con ese nombre, el comando lista los archivos parecidos (por ejemplo,
`tickets (1).json`).

### `geo:validar`

Revisa el `tickets.json` y sale con código 1 si hay errores.

-   **Errores (bloquean):** JSON inválido (informa la línea de una posible
    coma de más); faltan `date`, `city`, `alt` o `link`; fecha inexistente
    (debe ser `AAAAMMDD`); ciudad con formato inválido o que no está en
    `seo-config.json`; ticket repetido (misma fecha y ciudad); link que no es
    una URL http o https, o con espacios; `startTime` o `endTime` que no son
    `HH:MM`; `endTime` sin `startTime`; `price` no numérico (el decimal es con
    punto); `currency` que no son 3 letras mayúsculas; imagen que no es un
    PNG o cuyo nombre tiene otras mayúsculas.
-   **Avisos (no bloquean):** claves desconocidas (por ejemplo, un error de
    tipeo); fechas sin ordenar o a más de un año; link `http` o repetido;
    `type` poco habitual; `price` sin `currency` cuando la ciudad no tiene
    moneda por defecto; ninguna fecha vigente; imagen que no está en el
    proyecto ni en producción.
-   **Imágenes:** para cada ticket vigente busca
    `imgs/tickets/AAAAMMDD-ciudad.png` en la carpeta de `--imgs` (si se
    pasa), en `imgs/tickets/` del proyecto y, por último, en producción
    (consulta HEAD). Con `--sin-red` no consulta producción; si no hay red,
    lo informa como aviso.
-   Informa las fechas agregadas y quitadas respecto de `data/tickets.json`
    del proyecto.
-   **No verifica** que los links de compra respondan: los verifican Lucas y
    Mica antes de la entrega.
-   Opciones: `--tickets`, `--imgs`, `--url` (origen de producción),
    `--sin-red`.

### `geo:ciudad`

Es el único comando que modifica un archivo del proyecto
(`scripts/seo-config.json`), y solo después de mostrar el texto exacto que va
a agregar y de que Lucas lo confirme.

-   Detecta las ciudades de `tickets.json` que no están en `seo-config.json`
    y pregunta nombre en español e inglés, país (si el país no existe, también
    su nombre y moneda), zona horaria y, opcionalmente, un nombre fijo del
    evento (`defaultName`).
-   Con `--id <ciudad>` agrega una ciudad sin leer ningún `tickets.json` (por
    ejemplo, cuando Mica avisa antes de enviarlo). Los datos pueden pasarse
    por opción (`--es`, `--en`, `--pais`, `--pais-es`, `--pais-en`,
    `--moneda`, `--zona`, `--nombre-evento`); `--si` omite la confirmación y
    `--dry-run` muestra lo que escribiría sin guardar.
-   Agrega el texto al final del bloque correspondiente, sin reformatear el
    resto del archivo, y comprueba que el resultado sea un JSON válido que
    solo difiere en lo agregado. Si nadie puede responder la confirmación,
    no guarda.
-   Los casos especiales (`region`, `display`, como en `cafe-polenta`) se
    editan a mano en `seo-config.json`.
-   Tras correrlo, `seo-config.json` queda modificado sin commitear.

### `geo:preparar`

Publicación semanal. Pasos:

1.  Valida el `tickets.json` con `geo:validar` (acepta sus opciones). Si hay
    errores, se detiene y no genera nada.
2.  Corre `build-seo` en una carpeta temporal con copias de `index.html`,
    de los tres archivos de `scripts/` que usa y del `tickets.json` nuevo.
    No modifica `data/tickets.json`, `index.html`, `llms.txt` ni
    `sitemap.xml` del proyecto.
3.  Controla el resultado: `index.html` cambia solo dentro del bloque
    JSON-LD; hay un evento por fecha vigente; `llms.txt` incluye la fecha
    (en español e inglés) y el link de cada fecha vigente, y no quedan marcas
    `{{...}}`; `sitemap.xml` tiene las páginas de `seo-config.json`.
4.  Deja `entrega-geo/AAAAMMDD-HHMM/` (hora de Argentina) con `index.html`,
    `llms.txt`, `sitemap.xml`, una copia exacta del `tickets.json` validado y
    `LEEME.txt`, con las instrucciones y los avisos para Mica.

No incluye imágenes ni `robots.txt`. `--dry-run` hace todo menos escribir la
carpeta de entrega. Si la carpeta del mismo minuto ya existe, no la pisa.

El `index.html` base es el del proyecto en la rama activa.

### `geo:zip`

Publicación de versión nueva. Corre `build-seo` en el proyecto (actualiza
`index.html`, `llms.txt` y `sitemap.xml`), controla que el JSON-LD tenga un
evento por fecha vigente de `data/tickets.json` y arma
`entrega-geo/polenta-web-AAAAMMDD-HHMM.zip`.

El zip **no incluye** `data/tickets.json` ni `imgs/tickets/`, que administra
Mica en producción, de modo que no puede pisarlos. Tampoco incluye lo que no
es del sitio: `.git`, `.vscode`, `node_modules`, `documentation`, `scripts`,
`scss`, `entrega-geo`, `seo-out`, `package.json`, `package-lock.json`,
`.gitignore` y `.DS_Store`. Después de armarlo, abre el zip y comprueba que
no contenga nada de lo excluido. La lista de exclusiones está al principio de
`scripts/geo/zip.js`.

Opciones: `--sin-build` (arma el zip con los archivos tal como están, sin
regenerar) y `--dry-run` (muestra qué entraría y no escribe nada).

### `geo:verificar`

Verificación posterior a la publicación. Solo hace pedidos de lectura (GET y
HEAD) al sitio, con un parámetro anti-caché. Sale con código 1 si hay
errores.

-   La home, `/llms.txt`, `/sitemap.xml` y `/robots.txt` responden y tienen
    contenido real (detecta páginas de error del hosting que respondan 200);
    `robots.txt` apunta al sitemap.
-   `/data/tickets.json` publicado es válido y coincide con el local
    (ignorando el orden de las claves).
-   La imagen de cada ticket vigente existe en producción.
-   En la home: `lang="es"`, `canonical`, `og:image` y JSON-LD. El JSON-LD se
    parsea, incluye Organization y WebSite y tiene un evento por ticket
    vigente, cada uno con nombre, fecha, ubicación, imagen y oferta que
    coincide con el link del ticket.
-   `llms.txt` tiene las fechas (en español e inglés) y el link, en ambos
    idiomas, de cada ticket vigente.
-   Las páginas listadas en `sitemap.xml` responden.

Opciones: `--url <origen>` (para verificar una preview o un staging) y
`--tickets <ruta>` (otro `tickets.json` local para comparar).

Es una verificación estructural propia. **No reemplaza** al Rich Results
Test de Google, que no tiene API pública y sigue siendo el paso manual final.

## 4. Publicación semanal (actualización de fechas)

1.  **Mica**: sube las imágenes de los tickets nuevos y actualiza
    `tickets.json` (`date`, `city`, `alt`, `link` y, si los tiene, `name`,
    `venue`, `address`, `startTime`, `endTime`, `price`, `currency`,
    `type`). Avisa a Lucas, antes de que corra el script, si hay una ciudad
    nueva, y le envía el `tickets.json`.
2.  **Lucas**:
    -   guarda el `tickets.json` en `~/Downloads/tickets.json`, sin pegarlo en
        el proyecto;
    -   si hay ciudad nueva, corre `npm run geo:ciudad`;
    -   corre `npm run geo:preparar` y revisa los avisos;
    -   entrega a Mica la carpeta `entrega-geo/AAAAMMDD-HHMM/`.
3.  **Mica**: sube por CPanel `index.html`, `llms.txt` y `sitemap.xml` a la
    raíz y `tickets.json` a `data/`, siguiendo el `LEEME.txt`, además de las
    imágenes nuevas en `imgs/tickets/`. El `LEEME.txt` recomienda subir
    primero las imágenes que falten. No toca `robots.txt`.
4.  **Verificación** (ver sección 6).

Los comandos no actualizan el proyecto: `data/tickets.json`, `index.html`,
`llms.txt` y `sitemap.xml` del repositorio siguen como estaban. Actualizarlos
con los archivos de la entrega, para que el repositorio refleje lo
publicado, es un paso manual aparte, a decisión de Lucas.

## 5. Publicación de versión nueva (cambios complejos o rediseños)

1.  **Lucas**: corre `npm run geo:zip` y pasa a Mica el zip de
    `entrega-geo/`.
2.  **Mica**: descomprime y pega todo el contenido desde el administrador de
    archivos de CPanel.
3.  **Mica**: el zip no trae `data/tickets.json` ni `imgs/tickets/`, así que
    no los pisa; antes de publicar, debe confirmarse que el `tickets.json` de
    producción es el mismo que usó `build-seo` (el JSON-LD y `llms.txt` se
    generaron con el del proyecto). `geo:verificar` lo comprueba.
4.  **Ambos**: repiten la verificación (sección 6).

### Primera publicación GEO

La primera publicación GEO es una versión nueva (zip), no una semanal. Está
prevista para el miércoles 25-11-2026 desde la rama `feat-GEO`, como
excepción al flujo de ramas de [AGENTS.md](AGENTS.md): no se hace merge a
`branch_deploy` antes de publicar, porque hay que verificar cómo queda todo
lo relacionado con GEO y su automatización en producción.

## 6. Verificación posterior

-   **Mica**: recarga fiestapolenta.com sin caché y comprueba que los tickets
    nuevos aparecen con su imagen y su link; abre `/llms.txt`, `/sitemap.xml`
    y `/robots.txt` (sin 404) y verifica que las fechas de `llms.txt`
    coinciden con las del sitio.
-   **Lucas**: corre `npm run geo:verificar` y valida el JSON-LD de la home
    con el Rich Results Test de Google o validator.schema.org: sin errores y
    con un evento por fecha vigente.

## 7. Ciudad nueva sin cargar en `seo-config.json`

El sitio no se rompe: `tickets.js` no usa `seo-config.json`, y el ticket se ve
con su imagen y su link. Lo que se degrada es el GEO:

-   `geo:validar` lo informa como error y `geo:preparar` se detiene.
-   `build-seo` (y `geo:zip`, que no valida antes) solo avisa y genera el
    evento sin ubicación: el JSON-LD queda sin `location` y con el nombre
    «Fiesta Polenta*», se descartan `startTime` y `endTime` por falta de zona
    horaria, y `llms.txt` muestra la fecha sin «(ciudad, país)».
-   `geo:verificar` lo marca como aviso en el sitio publicado.

La solución es `npm run geo:ciudad` o cargar la ciudad a mano en
`seo-config.json`, y volver a generar.

## 8. Avisos de `build-seo`

-   «Ciudad no está en `seo-config.json`»: falta cargarla (ver sección 7).
-   «Fecha inválida»: debe ser `AAAAMMDD`; la corrige Mica.
-   «Sin link de compra»: falta `link` en esa fecha.
-   «Hay `price` pero no `currency`»: solo ocurre si la ciudad no tiene
    moneda por defecto en `seo-config.json`; agregar `currency`.

`geo:validar` detecta estos casos antes de generar.

## 9. Pendientes técnicos de Lucas

-   Zona horaria en `tickets.js` (observación en
    [04-section-tickets.md](04-section-tickets.md)). La regla de fechas
    (hoy y los 2 días anteriores) está repetida en `tickets.js`
    (`DAYS_TO_KEEP`) y en `scripts/seo-config.json` (`daysToKeep`), que usan
    `scripts/build-seo.js` y los comandos `geo:*`; si cambia en una, debe
    cambiar en la otra.
-   Imagen Open Graph definitiva (hoy `slider-img-1.png`, provisoria).
-   Los textos fijos de `llms.txt` se editan en `scripts/llms.template.txt`
    y `scripts/seo-config.json`, nunca en `llms.txt`.
-   Si cambia el flujo, actualizar también el PDF para Mica (no tiene fuente
    en el repositorio: se regenera a partir de este documento).
-   El repositorio no se actualiza solo con lo publicado (sección 4).

## 10. Automatización: estado y límites

-   Los comandos `geo:*` funcionan por ahora solo en la Mac de Lucas. La
    subida al hosting sigue siendo manual por CPanel (no hay FTP ni SSH
    confirmados).
-   Los links de compra no se verifican automáticamente.
-   La verificación posterior es estructural y no reemplaza al Rich Results
    Test.
-   La skill `geo-semanal`
    ([.claude/skills/geo-semanal/SKILL.md](../.claude/skills/geo-semanal/SKILL.md))
    permite invocar el flujo desde Claude. Resume este documento y conserva
    las reglas de [AGENTS.md](AGENTS.md): pide autorización antes de correr
    comandos que escriben archivos y no hace operaciones Git de escritura.
    Si cambia el flujo, hay que actualizarla junto con este documento.
-   No hay decisión tomada sobre crear un agente de Fiesta Polenta*;
    depende de los flujos que defina Maru. Evaluar que Mica use los comandos
    y que se ejecuten en la nube también queda para más adelante.
