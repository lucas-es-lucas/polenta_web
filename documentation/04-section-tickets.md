# Polenta Web — Section Tickets

## 1. Propósito

Tickets presenta los eventos disponibles de Fiesta Polenta y se renderiza
dinámicamente mediante `tickets.js`.

En la arquitectura actual de `feat-hero-assets`, Tickets aparece después del
Hero animado y antes de la section Nosotros.

## 2. Relación con Hero y Loader

Hero y Tickets están visualmente diferenciados, pero comparten un contenedor
general y un único video de fondo.

El scroll desde Hero hacia Tickets será continuo y seguirá el desplazamiento
normal del documento.

La carga y el renderizado de Tickets no deben condicionar la salida del loader
inicial.

Tickets no forma parte de los recursos críticos del loader: su obtención y
renderizado dinámico continúan de manera independiente.

La arquitectura compartida de Hero y Tickets se documenta en:

`02-bloque-hero-tickets.md`

Las condiciones de carga y salida del loader se documentan en:

`05-loader.md`

## 3. Estado actual de implementación

### Implementado y verificado

-   `tickets.js` carga y procesa los datos de Tickets.
-   Los tickets se insertan dinámicamente en `#ticketsSlider`.
-   `index.html` contiene Tickets después de las animaciones de Hero dentro
    del bloque `.hero`.
-   La navegación a `#tickets` usa un ancla auxiliar dentro de su contenedor.
    El título queda a la misma distancia visible de la cabecera fija que los
    títulos de Nosotros y Puestas, sin modificar el scroll normal compartido
    con Hero.
-   Hasta `1199px`, `#ticketsSlider` utiliza una única columna.
-   Desde `1200px`, `#ticketsSlider` utiliza una grilla de dos columnas y
    centra el último ticket cuando la cantidad de elementos es impar.

### Aspectos pendientes de validación

-   Verificar la continuidad visual del video de fondo durante el scroll desde
    Hero hacia Tickets.
-   Validar la presentación responsive del bloque compartido, sin alterar la
    lógica funcional confirmada de Tickets.
-   La estructura HTML podrá ajustarse si fuera necesario, preservando la
    lógica funcional confirmada de Tickets.

## 4. Fuente de datos

`tickets.js` carga:

`/data/tickets.json`

Cada objeto utilizado por el script incluye, como mínimo:

-   `date`, con formato `YYYYMMDD`;
-   `city`, usado para formar la ruta de imagen;
-   `alt`, texto alternativo de la imagen;
-   `link`, destino de compra.

La imagen se resuelve como:

`/imgs/tickets/{date}-{city}.png`

## 5. Regla de visibilidad

`tickets.js` usa:

`DAYS_TO_KEEP = 2`

El script normaliza la fecha actual a las 00:00 y calcula una fecha de corte
dos días anterior.

Un ticket no se renderiza cuando su fecha es anterior a esa fecha de corte.

Por lo tanto, se muestran los tickets de hoy, ayer y anteayer. Los tickets
anteriores no se agregan al slider.

## 6. Renderizado y presentación

Los tickets se agregan dinámicamente a `#ticketsSlider`.

Cada ticket renderizado incluye:

-   una imagen;
-   un enlace de compra.

La cantidad de tickets puede variar durante la semana. Las fechas futuras se
agregan manualmente en los datos y las fechas obsoletas se excluyen mediante
JavaScript.

## 7. Precauciones y alcance

Antes de cambiar la lógica de fechas, la estructura de `tickets.json`, el
nombre de las imágenes o los enlaces de compra, se deben revisar `tickets.js`
y los datos actuales.

Las especificaciones visuales y funcionales propias del Hero se documentan en:

`03-section-hero.md`

No se deben asumir elementos HTML definitivos, breakpoints adicionales ni
cambios funcionales en Tickets mientras la estructura final de Hero + Tickets
continúe en implementación.
