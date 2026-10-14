# Polenta Web — Bloque Hero + Tickets

## 1. Propósito

Este documento define la arquitectura compartida entre Hero y Tickets para la
versión `feat-hero-assets`.

Hero y Tickets estarán visualmente diferenciados, pero formarán parte de un
bloque general con un único video de fondo compartido.

## 2. Recorrido visual previsto

El recorrido visual dentro del bloque será:

`Hero animado → Tickets → Nosotros`

El usuario verá primero las dos animaciones de Hero:

-   asterisco;
-   logo.

Al continuar el scroll, llegará a Tickets. Después de Tickets comenzará la
section Nosotros.

## 3. Requisitos confirmados

-   Hero y Tickets compartirán un contenedor general.
-   Existirá un único elemento de video de fondo para ambas áreas.
-   El video no debe duplicarse ni reiniciarse durante la transición visual
    entre Hero y Tickets.
-   El scroll entre Hero y Tickets será continuo y seguirá el desplazamiento
    normal del documento.
-   No se utilizará un sistema de scroll interno independiente.
-   Hero mostrará las dos animaciones antes de Tickets.
-   Tickets conservará su lógica actual de carga, filtrado y renderizado.
-   El contenido siguiente a Tickets será Nosotros.
-   La estructura HTML definitiva podrá ajustarse durante la implementación.

## 4. Estado actual de implementación

### Implementado y verificado

-   `index.html` contiene Hero antes de Tickets dentro del bloque `.hero`.
-   El bloque contiene un único video de fondo, `#hero_bgs`.
-   Hero contiene las animaciones de asterisco y logo antes de Tickets.
-   Las animaciones se superponen mediante la implementación de estilos actual.
-   La lógica de Tickets continúa dependiendo de `tickets.js`.
-   La variante de video de fondo se selecciona dinámicamente según el
    viewport, sin insertar ni precargar las variantes inactivas.
-   La composición responsive de las animaciones contempla mobile, tablet,
    desktop y el rango de `992px` a `1199px`.
-   El CTA fijo "COMPRAR TICKETS" usa una única instancia de
    `IntersectionObserver`: en desktop aparece después del bloque completo
    Hero + Tickets; en mobile se muestra durante Hero, se oculta al llegar al
    título de Tickets y reaparece al terminar la section.

### Parcialmente implementado

-   Los estilos del bloque contemplan la disposición actual, pero el
    comportamiento responsive definitivo continúa pendiente de validación.

### Pendiente de implementación o validación

-   Validar la reproducción de los recursos de video en los navegadores
    objetivo, además de los dispositivos Apple ya comprobados.

## 5. Decisiones pendientes

Este documento no define todavía:

-   la estructura HTML definitiva del contenedor compartido;
-   las clases, IDs o elementos concretos que representarán Hero y Tickets;
-   breakpoints, dimensiones o reglas responsive;
-   técnicas de posicionamiento o superposición de las animaciones;
-   mecanismos técnicos para verificar o conservar la reproducción del video.

Estas decisiones deberán definirse durante la implementación y documentarse
cuando estén confirmadas.

## 6. Alcance documental

Las especificaciones propias de Hero se documentan en:

`03-section-hero.md`

La lógica y los requisitos propios de Tickets se documentan en:

`04-section-tickets.md`

La carga y el renderizado de Tickets no deben condicionar la salida del loader
inicial. Las condiciones de carga y salida del loader se definen en
`05-loader.md`.

El loader inicial, sus recursos críticos y su relación con Hero se documentan
en:

`05-loader.md`

No se deben modificar de forma aislada el contenedor general, el video de
fondo o el comportamiento de scroll de Hero o Tickets sin revisar su relación
dentro de este bloque compartido.
