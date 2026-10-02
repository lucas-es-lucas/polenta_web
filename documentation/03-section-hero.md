# Polenta Web --- Section Hero

## 1. Propósito

Este documento describe las características propias de la section Hero.

## 2. Contenido

La section Hero utiliza un video compuesto propio. Incluye el logo animado,
el asterisco animado y el fondo en un único recurso. JavaScript asigna una
única fuente compatible (`WebM` o `MP4`) según el viewport, por lo que las
variantes inactivas no se cargan en el render inicial.

-   Bajo `768px` en orientación vertical:
    `imgs/assets-hero-section/m-asterisk-blue-logo`.
-   Bajo `768px` en orientación horizontal:
    `imgs/assets-hero-section/m-640-asterisk-blue-logo`.
-   Desde `768px` hasta `1199px` en orientación horizontal:
    `imgs/assets-hero-section/tablet-asterisk-blue-logo`.
-   Desde `1200px`: `imgs/assets-hero-section/asterisk-blue-logo`.

No hay un recurso específico de tablet vertical en
`imgs/assets-hero-section`; por ello, desde `768px` hasta `1199px` en
orientación vertical Hero reutiliza `m-asterisk-blue-logo`, la composición
vertical disponible.

Cada variante ofrece WebM y MP4 como alternativas de compatibilidad.

## 3. Fondo

Hero utiliza su propio video compuesto. El comportamiento de separación con
Tickets está documentado en:

`02-bloque-hero-tickets.md`

## 4. Estado inicial

Al cargar el sitio, después del loader inicial, la section Hero es la
primera section que visualiza el usuario.

Las animaciones de Hero comienzan cuando finaliza la transición del loader.
De forma predeterminada se reproducen en loop. Cuando el dispositivo indica
`prefers-reduced-motion: reduce`, se reproducen una única vez y sin loop.

## 5. Relación con Tickets

Hero y Tickets son sections independientes. Entre ambas se visualiza la
section Nosotros; Tickets utiliza un video de fondo propio.

## 6. Referencias visuales

Las siguientes referencias orientan la composición visual de la nueva versión
de Hero:

-   Mobile: <https://figma.fun/41xpLC>
-   Desktop: <https://figma.fun/20WBGr>

Estas referencias no definen por sí solas comportamientos adicionales que no
estén expresados en esta documentación.

## 7. Información pendiente

La documentación disponible no especifica:

-   dimensiones o posición de los assets;

Estos aspectos deben verificarse en el código existente o definirse
explícitamente antes de modificarlos.
