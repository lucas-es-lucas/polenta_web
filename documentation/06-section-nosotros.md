# Polenta Web — Section Nosotros

## 1. Propósito y alcance

Nosotros presenta qué es Polenta y cuatro rasgos de la fiesta: Dance Crew,
Lanza Remeras, Churros y Crew de Ángeles.

Este documento describe el código vigente de `feat-redesign-sections` al
2026-10-27. Separa implementación, validaciones informadas y comprobaciones
pendientes; no certifica una publicación en producción.

## 2. Estructura y archivos

`index.html` contiene `.nosotros__container`, el ancla auxiliar `#nosotros` y
`.nosotros__section`. Dentro de la section se encuentran:

-   `.nosotros__queeslapolenta`: título, frase principal y explicación secundaria.
-   `.nosotros-cards`: una lista `.nosotros-cards__grid` con cuatro elementos
    `.nosotros-card`, cada uno con `tabindex="0"`.
-   Cada card incluye imagen mediante `picture`, título y descripción dentro
    de un panel de color.

Archivos principales:

-   `scss/sections/_nosotros.scss`: composición, grilla e interacción.
-   `index.js`: medición de la introducción y del desplazamiento de navegación.
-   `scss/_general.scss`: gutter compartido y `scroll-padding-top`.
-   `scss/elements/_texts.scss`: tipografía general.
-   `css/estilos.css` y `css/estilos.css.map`: resultados de compilación.

No se separó la primera fila en otro bloque HTML. Reorganizar el marcado queda
como alternativa si el enfoque actual no satisface las comprobaciones.

## 3. Grilla e imágenes

| Ancho del viewport | Columnas | Filas actuales |
| --- | --- | --- |
| Hasta `575px` | 1 | 4 |
| `576px–1199px` | 2 | 2 |
| Desde `1200px` | 4 | 1 |

Las cards se alinean con el gutter general: `5%` por lado bajo `992px` y
`10%` desde ese ancho. El gap es `clamp(1rem, 1.6vw, 1.5rem)`.

Las imágenes conservan variantes mobile, tablet y desktop, carga diferida y
decodificación asíncrona. Usan `object-fit: cover` y posiciones de recorte
específicas por card. Cambiar la altura modifica el recorte visible.

Fuera del cálculo compacto, el pseudo-elemento `::before` reserva altura
mediante proporciones. La base usa `16 / 10`; desde `576px`, `4 / 3`; desde
`1200px`, `1 / .85`. En dispositivos con hover y puntero fino se aplican las
proporciones de esa variante: `4 / 3`, `1 / 1` y `3 / 4`, respectivamente.
Estas proporciones se reemplazan cuando está activo un cálculo explícito.

## 4. Composición intermedia compacta

Se activa entre `768px` y `1199px`, con hasta `900px` de alto.

El objetivo al navegar a `#nosotros` es conservar el protagonismo del título,
la frase “Polenta* no es cualquier fiesta.” y la primera fila completa. La
explicación secundaria se conserva cuando corresponde; la segunda fila
continúa mediante scroll normal. Puede asomar una pequeña porción de esa fila.

Ambas filas comparten el mismo alto. CSS lo determina con esta cuenta:

```text
alto de fila = max(
    mínimo de card,
    100svh
    − scroll-padding-top medido
    − separación entre ancla y título
    − altura real de la introducción
    − gap entre introducción y cards
    − margen inferior visual
)
```

Valores vigentes:

| Variable o regla | Valor |
| --- | --- |
| Mínimo de card, `768px–959px` | `22rem` |
| Mínimo de card, `960px–1199px` | `20rem` |
| Margen inferior visual | `2rem` |
| Gap entre introducción y cards | `clamp(1.25rem, 3svh, 2rem)` |
| Título | `clamp(4.5rem, 7.5vw, 6rem)`, interlineado `.95`, salto natural |
| Frase principal | `clamp(1.25rem, 2.8svh, 1.75rem)` |
| Explicación secundaria | `clamp(1.125rem, 2.4svh, 1.5rem)` |

Hasta `640px` de alto se oculta únicamente la explicación secundaria. La frase
principal permanece visible. Los mínimos de card son valores iniciales a
comprobar con los paneles abiertos: no garantizan por sí mismos que todo texto
quepa. Si falta alto, se acepta scroll antes que degradar excesivamente el
encabezado o recortar contenido.

El margen de `2rem` permite superposición parcial con el CTA; no reserva toda
su altura. La referencia aproximada de `340px` observada en Puestas no es una
altura fija ni un resultado garantizado para Nosotros.

### Medición y activación

Un bloque independiente de `index.js`:

1.  Comprueba la existencia de la introducción, `ResizeObserver` y soporte de `100svh`.
2.  Mide su altura con `getBoundingClientRect`, redondeando hacia arriba.
3.  Lee el `scroll-padding-top` calculado del documento.
4.  Escribe `--nosotros-intro-height` y `--nosotros-scroll-offset`.
5.  Activa `.nosotros--viewport-ready`.

Con esa clase, `grid-auto-rows` recibe la altura calculada, las cards ocupan
el `100%` de su fila y `::before` deja de imponer una proporción.

La medición se actualiza mediante `ResizeObserver` sobre la introducción,
`resize`, cambios de la media query y `document.fonts.ready`. Se agrupan las
actualizaciones con `requestAnimationFrame`. No se mide durante cada scroll
ni se observa el alto de toda la sección.

Al salir del rango se eliminan la clase y las dos medidas inline. Sin la
medición, las cards conservan las proporciones base; no se garantiza el mismo
encaje vertical. La section mantiene altura natural y ambas filas participan
del flujo del documento.

## 5. Ancla y CTA

En el rango intermedio se comparten estas variables:

```scss
--nosotros-narrow-padding-top: clamp(4rem, 8vh, 5rem);
--nosotros-narrow-anchor-gap: clamp(3rem, calc(7.4vw - .55rem), 5rem);
```

El padding superior de la section usa la primera variable; la posición del
ancla es su diferencia respecto de la segunda. Al navegar, el título queda
a `scroll-padding-top + anchor-gap` del borde superior del viewport. El
presupuesto de cards no debe descontar otra vez el padding superior.

La medición de Nosotros no modifica el scroll ni controla el CTA. El observer
del botón descuenta la altura real del header por separado, según
[02-bloque-hero-tickets.md](02-bloque-hero-tickets.md).

## 6. Desktop compacto

Desde `1200px`, con hasta `900px` de alto, se conserva una composición
independiente de cuatro columnas:

-   Contenedor sin padding exterior y section con mínimo de `100svh`.
-   Título de una línea: `clamp(4.5rem, 6vw, 6rem)`.
-   Cards con `height: clamp(14rem, calc(100svh - 27rem), 125cqi)` y
    `::before` sin proporción.
-   Tipografía interna adaptada al ancho del contenedor de cada card.
-   Ancla sincronizada con `--nosotros-compact-padding-top`, ubicada `3rem`
    antes del título.

Esta variante no utiliza la medición intermedia. Con más de `900px` de alto
se mantienen las reglas generales correspondientes a cada ancho.

## 7. Interacción y accesibilidad

El título se muestra sobre la foto en reposo. Hover o foco expanden el color
del panel y revelan su descripción. El código vigente utiliza `:hover` y
`:focus`; `:focus-visible` proporciona un contorno para teclado. El foco
permite activar el panel sin depender exclusivamente del hover; su
comportamiento táctil debe comprobarse en los navegadores objetivo.

Existen reglas para reducir transiciones con `prefers-reduced-motion`. Su
resultado debe verificarse considerando la cascada completa de estilos.

El alto calculado no cambia deliberadamente al abrir un panel. Como las cards
y textos usan recorte de desbordamiento, es necesario comprobar que ningún
texto quede oculto al interactuar, ampliar texto o usar zoom. Mantener
`tabindex` y selectores de foco no equivale a una auditoría de accesibilidad.

## 8. Estado y validaciones

### Implementado

La estructura, grilla, interacción, cálculo intermedio, mínimos, fallback por
proporciones y variante desktop descritos están presentes en el código.

### Validación informada

El usuario validó la navegación a Nosotros y la corrección del CTA durante el
ajuste previo. Tras incorporar el cálculo con medición, informó una evaluación
visual inicial favorable. La referencia comparativa corresponde aproximadamente
a `1191 × 768` CSS px; no representa una validación de toda la matriz.

### Pendiente de validación sistemática

-   Anchos `768`, `960`, `999` y `1199px` con altos cercanos a `768`, `800` y `900px`.
-   Límites `959/960`, `991/992`, `1199/1200`, `900/901` y `640/641`.
-   Entrada directa a `#nosotros` y navegación desde navbar y páginas legales.
-   CTA completamente visible y segunda fila accesible mediante scroll normal.
-   Las cuatro cards abiertas por hover, teclado y touch, sin recorte de texto.
-   Imágenes, zoom, texto ampliado, movimiento reducido y carga de fuentes.
-   Comportamiento sin medición y en viewports extremadamente bajos.

## 9. Compilación

Los cambios de estilos se realizan en SCSS. Generar CSS y mapa mediante:

```bash
npm run build-css
```

No editar manualmente `css/estilos.css` ni `css/estilos.css.map`.
