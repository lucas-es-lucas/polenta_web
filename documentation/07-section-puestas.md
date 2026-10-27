# Polenta Web — Section Puestas

## 1. Propósito y alcance

Puestas presenta la experiencia de luces, lásers, pantallas y visuales de
Polenta mediante una introducción y un carrusel de imágenes.

Este documento describe el código vigente de `feat-redesign-sections` al
2026-10-27. La implementación documentada no implica publicación en producción
ni validación completa en todos los dispositivos.

## 2. Estructura y archivos

`index.html` contiene `.puestas__container`, el ancla auxiliar `#puestas`,
`.puestas__section`, `.puestas__descripcion` y el carrusel
`[data-puestas-carousel]`, que conserva también la clase `.puestas__slider`.

El carrusel tiene una lista horizontal de slides, botones anterior/siguiente
e indicadores generados por JavaScript. El antiguo marcado comentado no
forma parte de la implementación activa.

Archivos principales:

-   `scss/sections/_puestas.scss`: distribución vertical, slides y controles.
-   `puestas.js`: destinos de navegación, indicadores, autoplay y eventos.
-   `index.js`: corrección de navegación a Contacto tras cambios de layout.
-   `scss/_general.scss` y `scss/elements/_texts.scss`: anclas, gutter y tipografía.
-   `css/estilos.css` y `css/estilos.css.map`: resultados de compilación.

## 3. Distribución vertical

La section utiliza Flexbox en columna con `height: 100vh`, reemplazado por
`100svh` cuando está soportado, y `min-height: 35rem`.

Se elimina el padding exterior heredado de `.container__propio`. Dentro de
la section, el padding superior es `6rem`, el horizontal usa el gutter
compartido y el inferior es `clamp(4.5rem, 10vh, 6rem)`. El `box-sizing:
border-box` general incluye estos paddings dentro de su altura.

La descripción utiliza `flex: 0 0 auto` y conserva su altura natural. El
carrusel recibe el espacio restante con `flex: 1 1 auto`, un mínimo de
`12.5rem`, ancho `min(100%, 68.75rem)` y margen superior
`clamp(1rem, 4vh, 3rem)`.

```text
alto disponible para el carrusel ≈
alto de section − paddings verticales − descripción real − margen superior
```

El resultado está limitado por el mínimo del carrusel. Si los textos,
paddings y mínimos superan el presupuesto, puede existir desbordamiento;
no se garantiza que todo quepa en cualquier alto de viewport.

El título hereda el tamaño responsive general y utiliza interlineado `.95`.
Los párrafos usan `clamp(1rem, 2.4vh, 2rem)` y la frase bold
`clamp(1.125rem, 2.8vh, 2.25rem)`. Hasta `640px` de alto se oculta sólo el
párrafo secundario, conservando la frase bold.

Una altura cercana a `340px` en la referencia visual es un resultado de esta
distribución, no una altura fija de diseño. A diferencia de Nosotros,
Puestas no necesita medir la introducción con JavaScript para distribuir
el alto; véase [06-section-nosotros.md](06-section-nosotros.md).

## 4. Slides e imágenes responsive

| Ancho del viewport | Ancho de slide | Controles e indicadores |
| --- | --- | --- |
| Hasta `767px` | `100%` del track | Ocultos |
| `768px–1199px` | `50%` del track | Visibles |
| Desde `1200px` | Un tercio del track | Visibles |

El track tiene scroll horizontal nativo, `scroll-snap-type: x mandatory`,
slides con `scroll-snap-align: start` y `scroll-snap-stop: always`, y barra
de desplazamiento oculta. Conserva el arrastre manual.

Las imágenes usan `picture`, variantes responsive, carga diferida y
decodificación asíncrona. Llenan el slide con `object-fit: cover` y centrado;
al variar el alto cambia el recorte visible.

## 5. Navegación e indicadores

`puestas.js` calcula destinos a partir del `offsetLeft` de cada slide,
limitándolos al máximo scroll horizontal. Elimina destinos consecutivos
duplicados al final del recorrido. Por eso los indicadores representan
posiciones navegables y no necesariamente una posición por imagen.

-   Los botones anterior/siguiente y las flechas izquierda/derecha sobre el
    track navegan entre destinos.
-   Los indicadores permiten seleccionar un destino; el activo utiliza
    `aria-current="true"` y cada botón tiene una etiqueta accesible.
-   La navegación programática vuelve al inicio después del último destino
    y al final cuando se retrocede desde el primero. No se clonan slides.
-   El scroll manual actualiza el indicador activo.
-   Al redimensionar se recalculan destinos e indicadores mediante
    `requestAnimationFrame`.

El carrusel tiene nombre accesible y rol de región; el track puede recibir
foco. Los controles incluyen etiquetas y estilos de foco visible.

## 6. Transición y autoplay

La navegación programática aplica `.is-fading`, reduce la opacidad del track,
espera `180ms` y desplaza el contenido antes de retirar la clase. El arrastre
manual conserva el desplazamiento nativo sin aplicar ese fade.

El autoplay programa un avance cada `2500ms` cuando se cumplen todas estas
condiciones:

-   No está solicitado `prefers-reduced-motion: reduce`.
-   La pestaña está visible.
-   El carrusel cumple el criterio de visibilidad del observer: al menos `35%`.
-   El puntero no está dentro y el carrusel no contiene el foco.
-   Existe más de un destino navegable.

Se detiene al entrar el mouse o el foco, y se reevalúa al salir. `pointerdown`
detiene el temporizador y cancela el fade; `pointerup` no mouse y
`pointercancel` reevalúan la reproducción. El evento de rueda detiene el
temporizador y la reevalúa después de `250ms` sin otro evento de rueda.
También reacciona a cambios de visibilidad del documento y movimiento reducido.

Con movimiento reducido, no hay autoplay ni fade programático, se usa
desplazamiento inmediato y se desactivan las transiciones declaradas para
track y controles. Si no existe `IntersectionObserver`, el código considera
visible el carrusel para evaluar autoplay.

Estas condiciones describen el código; las combinaciones de interacción
continúan sujetas a las comprobaciones indicadas al final.

## 7. Navegación por anclas y relación con Contacto

`#puestas` utiliza la regla general `.section-nav-target { top: 3rem; }`
dentro de su contenedor posicionado. La section conserva `6rem` de padding
superior; el título queda `3rem` después del ancla, además del espacio
reservado por `scroll-padding-top`.

El carrusel mantiene `.puestas__slider`, utilizada por la lógica existente
de `index.js` que observa cambios de tamaño y corrige una navegación pendiente
hacia Contacto. Esa corrección no reemplaza el scroll normal del documento.
La navegación inicial hacia sections posteriores también contempla el
renderizado diferido de Tickets.

No modificar el alto o la estructura del carrusel sin revisar sus efectos
sobre `#puestas` y la llegada a `#contacto`.

## 8. Estado y validaciones

### Implementado

La distribución Flexbox, slides responsive, navegación, indicadores,
transición, autoplay y reglas de movimiento reducido están presentes en
el código vigente.

### Validación informada

El usuario aportó una referencia aproximada de `1191 × 768` CSS px en la que
Puestas conserva presencia del título y textos con un carrusel de unos
`340px` de alto. Es una referencia visual; no acredita toda la matriz ni
una auditoría de interacción o accesibilidad.

### Pendiente de validación sistemática

-   Altura disponible con distintos saltos de texto y viewports bajos.
-   Breakpoints `767/768`, `1199/1200` y `640/641`, y cambio de gutter en `992px`.
-   Flechas, indicadores, teclado, arrastre táctil y scroll horizontal.
-   Autoplay, pausa y reanudación con puntero, foco, rueda y cambio de pestaña.
-   Criterio de visibilidad y movimiento reducido.
-   Etiquetas accesibles, orden y visibilidad del foco, zoom y texto ampliado.
-   Entrada directa a `#puestas`, navegación posterior a Contacto y CTA visible.
-   Recortes de imágenes y estabilidad con carga diferida y carga de fuentes.

## 9. Compilación

Modificar los estilos en SCSS y generar CSS y mapa mediante:

```bash
npm run build-css
```

No editar manualmente `css/estilos.css` ni `css/estilos.css.map`.
