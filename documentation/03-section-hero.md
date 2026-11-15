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
-   En condiciones normales, las animaciones se reproducen en loop. Con
    `prefers-reduced-motion: reduce`, se reproducen una única vez.
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
declara antes de la fuente WebM. El asterisco cuenta además con un poster PNG
estático para representar el recurso antes de que el primer frame esté
disponible.

## 4. Estado actual de implementación

### Implementado y verificado

-   `index.html` integra las dos animaciones de Hero antes de Tickets.
-   Los assets de asterisco y logo están disponibles e integrados desde
    `imgs/assets-mov/`.
-   Las animaciones se visualizan superpuestas mediante una grilla que ubica
    ambos videos en la misma celda.
-   El inicio de las animaciones queda coordinado por el loader; no dependen
    de `autoplay` en el marcado.
-   Los estilos de `scss/sections/_animations.scss` superponen ambas capas y
    ajustan escala y posición para mobile, tablet, desktop y el rango de
    `992px` a `1199px`.
-   La reproducción normal repite las animaciones; el modo de movimiento
    reducido reproduce una única vez.

### Pendiente de implementación o validación

-   Validar la reproducción y compatibilidad de los videos en los navegadores
    objetivo, además de los dispositivos Apple ya comprobados.

## 5. Decisiones técnicas pendientes

Esta especificación no define todavía:

-   sincronización exacta entre animaciones;
-   pausa al salir del viewport;
-   reinicio al regresar a Hero;

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
