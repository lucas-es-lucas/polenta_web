# Polenta Web — Bloque Hero + Tickets

## Propósito

Hero y Tickets son sections independientes contenidas en el bloque inicial
`.hero-tickets-block`. Comparten el video de fondo, pero Hero agrega las
animaciones visuales propias.

## Visualización y scroll

El bloque comienza debajo del header fijo y ocupa el alto disponible del
viewport, descontando la announcement bar y la navbar. Tiene scroll vertical
interno sin barra visible: primero se muestra Hero y luego Tickets. Al llegar
al final del bloque, el scroll continúa normalmente hacia las sections
siguientes del documento.

El video y la superposición permanecen visibles durante todo el recorrido
interno. Hero y Tickets se centran de forma independiente dentro del alto
visible del bloque. Se carga sólo una variante de video: vertical bajo 768 px y en tablet
vertical; horizontal de tablet entre 768 px y 1199 px en orientación
horizontal; y desktop desde 1200 px.

## Tickets

Tickets mantiene `#tickets`, `#ticketsSlider` y su renderizado desde
`tickets.js`. No debe condicionar la salida del loader.
