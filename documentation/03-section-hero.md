# Polenta Web — Section Hero animada

## 1. Propósito

Hero funciona como presentación visual inicial del sitio en la versión
`feat-hero-assets`.

Se muestra después de la transición de salida del loader y antes de Tickets.
Su arquitectura compartida con Tickets se define en:

`02-bloque-hero-tickets.md`

## 2. Requisitos funcionales confirmados

-   Hero contiene dos animaciones:
    -   asterisco azul;
    -   logo tipográfico.
-   Ambas animaciones deben visualizarse superpuestas, una sobre la otra.
-   Las animaciones comienzan una vez finalizada la transición de salida del
    loader.
-   Hero comparte su video de fondo con Tickets.
-   El usuario puede continuar desde Hero hacia Tickets mediante el scroll
    normal del documento.
-   La presentación debe adaptarse a diferentes tamaños y orientaciones de
    pantalla.

## 3. Assets de animación

Los recursos disponibles para las animaciones se encuentran en:

`imgs/assets-mov/`

### Asterisco azul

-   `asterisk-blue-square-hevc-alpha-v3.mov`
-   `asterisk-blue-vp9.webm`

### Logo tipográfico

-   `logo-type-changing-hevc-alpha-v3.mov`
-   `logo-type-changing-vp8.webm`

Los recursos indicados están integrados en `index.html`: la fuente MOV/HEVC se
declara antes de la fuente WebM. La validación en los navegadores objetivo
continúa pendiente, salvo la comprobación realizada en dispositivos Apple.

## 4. Estado actual de implementación

### Implementado y verificado

-   `index.html` integra las dos animaciones de Hero antes de Tickets.
-   Los assets de asterisco y logo están disponibles e integrados desde
    `imgs/assets-mov/`.
-   Las animaciones se visualizan superpuestas mediante una grilla que ubica
    ambos videos en la misma celda.
-   Los videos declaran `autoplay`, `muted`, `loop`, `playsinline` y
    `preload="auto"`.
-   Los estilos correspondientes a esta implementación están presentes en
    `css/estilos.css`.
-   La reproducción sin fondos negros fue validada en dispositivos Apple.

### Parcialmente implementado

-   Los estilos de `scss/sections/_hero.scss` y
    `scss/sections/_animations.scss` incluyen la implementación actual, pero
    su comportamiento responsive definitivo todavía no fue validado.

### Pendiente de implementación o validación

-   Validar el comportamiento responsive definitivo.
-   Validar la reproducción y compatibilidad de los videos en los navegadores
    objetivo, además de los dispositivos Apple ya comprobados.
-   Validar la presentación visual de Hero en los tamaños y orientaciones de
    pantalla definidos durante la implementación.

## 5. Decisiones técnicas pendientes

Esta especificación no define todavía:

-   sincronización exacta entre animaciones;
-   pausa al salir del viewport;
-   reinicio al regresar a Hero;
-   breakpoints específicos;
-   dimensiones y posiciones definitivas;
-   comportamiento ante errores de reproducción.

Estas decisiones deberán definirse durante la implementación y documentarse
cuando estén confirmadas.

## 6. Alcance documental

La relación estructural, el video de fondo compartido y el scroll continuo
entre Hero y Tickets se documentan en:

`02-bloque-hero-tickets.md`

La lógica de carga, filtrado y renderizado de Tickets se documenta en:

`04-section-tickets.md`

El loader, su transición de salida y las condiciones de inicio de las
animaciones se documentan en:

`05-loader.md`
