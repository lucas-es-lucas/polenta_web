# Polenta Web — Bloque Hero + Tickets

## Propósito

Este documento describe el bloque inicial actual del sitio. Hero y Tickets no son sections independientes en esta versión: Tickets se renderiza dentro de `.hero`.

## Estructura

En `index.html`, `.hero` contiene:

1. el video de fondo `#hero_bgs`;
2. la capa `.hero-overlay`;
3. el contenedor `#tickets`, que incluye el título y `#ticketsSlider`.

El video se reproduce automáticamente, sin sonido, en loop y dentro de la página. Usa WebM como fuente principal y MP4 como alternativa:

- `imgs/video/bg-tickets.webm`
- `imgs/video/bg-tickets.mp4`

## Visualización y scroll

El bloque es el primer contenido de `main`, tiene una altura mínima de viewport y sigue el scroll normal del documento. El contenido de Tickets queda sobre el video gracias a la capa de contenido posicionada por encima del fondo y de la superposición.

Al dejar de ser visible `.hero`, `index.js` muestra el acceso fijo «COMPRAR TICKETS»; mientras `.hero` está visible, lo oculta.

## Alcance

No se deben tratar Hero y Tickets como secciones separadas ni cambiar el video, el contenedor o el comportamiento de scroll de uno sin revisar el otro. Una futura alternativa con Hero independiente debe documentarse en su propia rama, sin modificar esta especificación base hasta que se integre.
