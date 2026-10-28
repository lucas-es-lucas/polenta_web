# Polenta Web — Bloque Hero + Tickets

## 1. Propósito

Este documento define la arquitectura compartida entre Hero y Tickets,
incorporada en `feat-hero-assets`, e incluye los ajustes del CTA de
`feat-redesign-sections` y su variante mobile en `feat-cta-icon` al 2026-10-28.
Este estado no implica publicación en producción.

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
-   El CTA fijo "COMPRAR TICKETS" utiliza un `IntersectionObserver` activo
    a la vez. Su comportamiento y breakpoints se detallan a continuación.

### CTA fijo: comportamiento vigente

-   Bajo `1200px`, observa `.tickets__section`: permanece visible fuera de
    Tickets, incluido Hero, y se oculta mientras Tickets intersecta el área
    observable ajustada.
-   Desde `1200px`, observa `.hero-tickets`: permanece oculto mientras el
    bloque Hero + Tickets intersecta esa área y visible fuera de él.
-   En ambos modos utiliza `threshold: 0` y un `rootMargin` superior negativo
    igual a la altura real de `.header__fixed`, redondeada hacia arriba.
    Así excluye el contenido cubierto por la cabecera fija y evita que el CTA
    siga oculto al llegar a Nosotros hasta realizar un pequeño scroll.
-   Bajo `1200px`, agrega `-48px` al margen inferior del observer para
    conservar el ajuste relativo al padding previo al contenido de Tickets.
-   `syncCta` desconecta el observer anterior y crea uno nuevo al iniciar o
    cruzar el breakpoint de `1200px`. La altura del header se mide en ese
    momento; no existe una observación continua de sus cambios de altura.

### CTA fijo: presentación responsive

La variante incorporada en `feat-cta-icon` se limita a
`.go-to-tickets__index`, el enlace de `index.html` con destino a `#tickets`.

| Ancho del viewport | Presentación | Posición horizontal |
| --- | --- | --- |
| Hasta `767px` | Círculo de `3rem` de ancho y alto, con ícono de ticket de `1.5rem` de ancho | A la derecha, a `1.5rem` del borde |
| `768px–1199px` | Botón con ícono y texto visible «COMPRAR TICKETS» | Centrado |
| Desde `1200px` | Botón con ícono y texto visible «COMPRAR TICKETS» | A la derecha, a `clamp(1.25rem, 2vw, 2rem)` del borde |

En mobile, el texto se oculta únicamente de forma visual y permanece
disponible para lectores de pantalla. El círculo equivale a `48px` con una
base de `1rem = 16px`.

En los tres rangos conserva posición fija y
`bottom: max(1.25rem, env(safe-area-inset-bottom))`. El cambio de presentación
no modifica el destino del enlace ni la lógica de aparición del observer.
Los CTA de las páginas legales están comentados en su HTML y no forman parte
de esta variante.

La corrección del ancla de Nosotros y la reaparición del CTA fueron validadas
por el usuario durante el ajuste. La medición de la introducción de Nosotros
es independiente de este observer; no controla la visibilidad del botón.

El usuario informó una valoración visual favorable del cambio mobile. Esta
actualización documental se contrastó con el código; no acredita pruebas
completas de responsive ni de accesibilidad. Queda comprobar el límite
`767/768px`, la navegación al activar el CTA y su presentación con zoom,
lectores de pantalla y área segura inferior en los dispositivos objetivo.

Referencias: `index.html`, `index.js`, `scss/elements/_go-to-tickets.scss` y
[06-section-nosotros.md](06-section-nosotros.md).

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
