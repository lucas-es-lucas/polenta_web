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

-   `asterisk-blue.webm`
-   `asterisk-blue.mov`

### Logo tipográfico

-   `logo-type-changing.webm`
-   `logo-type-changing.mov`

Los recursos existen localmente, pero su integración definitiva y validación
en navegadores están pendientes.

## 4. Estado actual de implementación

### Implementado y verificado

-   `index.html` conserva la estructura original del bloque Hero + Tickets.
-   Los assets de asterisco y logo están disponibles en el directorio local
    `imgs/assets-mov/`.
-   Los estilos correspondientes a la implementación experimental del Hero
    están presentes en `css/estilos.css`, pero su funcionamiento visual
    definitivo todavía no fue validado.

### Parcialmente implementado

-   `index_copy.html` contiene una implementación experimental de las dos
    animaciones dentro del bloque común de Hero y Tickets.
-   `scss/sections/_hero.scss` contiene estilos parciales del bloque Hero.
-   `scss/sections/_animations.scss` contiene estilos específicos de las
    animaciones.

### Pendiente de implementación o validación

-   Integrar la nueva estructura de Hero en `index.html`.
-   Superponer visualmente las animaciones de asterisco y logo.
-   Implementar el comportamiento responsive definitivo.
-   Validar la reproducción y compatibilidad de los videos en los navegadores
    objetivo.
-   Validar la presentación visual de Hero en los tamaños y orientaciones de
    pantalla definidos durante la implementación.

## 5. Decisiones técnicas pendientes

Esta especificación no define todavía:

-   reproducción en loop;
-   sincronización exacta entre animaciones;
-   pausa al salir del viewport;
-   reinicio al regresar a Hero;
-   breakpoints específicos;
-   dimensiones y posiciones definitivas;
-   técnica CSS de superposición;
-   estrategia de fallback de video;
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
