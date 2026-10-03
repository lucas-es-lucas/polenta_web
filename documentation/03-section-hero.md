# Polenta Web — Contenedor Hero actual

## Propósito

La section `.hero` es el contenedor inicial actual del sitio y aloja el contenido de Tickets. Esta documentación describe solamente esa implementación existente.

## Composición

- Ocupa todo el ancho y tiene `min-height: 100vh`.
- El video de fondo ocupa el contenedor con `object-fit: cover` y centrado.
- `.hero-overlay` aplica una capa oscura sobre el video.
- `.hero-content` se ubica por encima de las capas visuales y contiene Tickets.

## Relación con Tickets

Tickets se encuentra dentro de `.hero`, no después de Hero. Ambos usan el mismo video de fondo definido en el HTML del bloque. Las clases de presentación de Tickets se mantienen en los estilos específicos de Tickets.

## Límites de esta especificación

Esta especificación cubre únicamente la implementación actual. Cualquier cambio que altere la composición, el contenido o la relación de Hero con Tickets debe definirse y documentarse antes de modificar esta base.
