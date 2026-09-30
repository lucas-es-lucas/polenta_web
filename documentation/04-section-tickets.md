# Polenta Web --- Section Tickets

## 1. Propósito

Este documento describe las características propias de la section
Tickets.

## 2. Contenido

La section Tickets contiene tickets.

Cada ticket tiene:

-   una imagen;
-   un link de compra.

## 3. Cantidad de tickets

La cantidad de tickets varía durante la semana.

Las fechas futuras se agregan manualmente.

Las fechas obsoletas se quitan mediante JavaScript.

## 4. Regla para mostrar u ocultar tickets

La lógica de visibilidad de los tickets está implementada en
`tickets.js`.

La constante:

``` js
const DAYS_TO_KEEP = 2;
```

define la cantidad de días que se conservan.

El código toma la fecha actual, la lleva a las 00:00 y calcula una fecha
de corte restando 2 días.

Luego compara la fecha de cada ticket con esa fecha de corte. Un ticket
se oculta cuando su fecha es anterior a la fecha de corte.

Por lo tanto, la regla vigente es:

> **Se muestran los tickets correspondientes a hoy, ayer y anteayer. Los
> tickets anteriores a anteayer no se renderizan.**

Ejemplo:

Si hoy fuera 12/06:

-   12/06 → se muestra.
-   11/06 → se muestra.
-   10/06 → se muestra.
-   09/06 o anterior → no se muestra.

## 5. Fuente de datos

El archivo:

`tickets.js`

carga la información desde:

`/data/tickets.json`

y utiliza esos datos para renderizar los tickets.

## 6. Relación con Hero

Tickets es una section independiente de Hero y utiliza su propio video de
fondo. La variante se selecciona por ancho: `bg-tickets-320-vertical` bajo
`768px`, `bg-tickets-768` desde `768px` hasta `1199px`, y `bg-tickets` desde
`1200px`.

El comportamiento compartido está documentado en:

`02-bloque-hero-tickets.md`

## 7. Información pendiente

La documentación disponible no especifica:

-   la estructura exacta de los objetos de `tickets.json`;
-   el comportamiento visual completo de los tickets;
-   el layout utilizado;
-   el proveedor o formato de los links de compra.

Estos aspectos deben verificarse en el código existente antes de
modificarlos.
