# Polenta Web — Section Tickets

## Propósito

Tickets se renderiza dentro del bloque `.hero` actual. Cada ticket incluye una imagen y un enlace de compra.

## Fuente de datos

`tickets.js` carga `/data/tickets.json`. Cada objeto usado por el script incluye, como mínimo:

- `date`, con formato `YYYYMMDD`;
- `city`, usado para formar la ruta de imagen;
- `alt`, texto alternativo de la imagen;
- `link`, destino de compra.

La imagen se resuelve como `/imgs/tickets/{date}-{city}.png`.

## Regla de visibilidad

`tickets.js` usa `DAYS_TO_KEEP = 2`. Normaliza la fecha actual a las 00:00 y calcula una fecha de corte dos días anterior. Un ticket no se renderiza cuando su fecha es anterior a esa fecha de corte.

Por lo tanto, se muestran los tickets de hoy, ayer y anteayer; los anteriores no se agregan al slider.

## Renderizado

Los tickets se agregan dinámicamente a `#ticketsSlider`. En desktop, los estilos organizan el slider en dos columnas y centran el último ticket cuando queda impar. La implementación visual está en los estilos de Tickets.

## Precauciones

Antes de cambiar la lógica de fechas, la estructura de `tickets.json`, el nombre de imágenes o el enlace de compra, revisar `tickets.js` y los datos actuales. Tickets comparte el contenedor y el video de fondo con Hero; ver `02-bloque-hero-tickets.md`.
