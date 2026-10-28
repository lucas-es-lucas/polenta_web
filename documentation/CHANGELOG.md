# Polenta Web --- Changelog

Este archivo registra cambios relevantes del proyecto.

No pretende registrar cada modificación menor de código. Debe utilizarse
para dejar constancia de cambios funcionales, estructurales o técnicos
que ayuden a comprender la evolución del proyecto.

## Formato

Cada entrada debe indicar:

-   fecha;
-   tipo de cambio;
-   descripción breve;
-   cuando corresponda, archivos o áreas afectadas.

Tipos sugeridos:

-   `Added` --- funcionalidad nueva.
-   `Changed` --- modificación de comportamiento existente.
-   `Fixed` --- corrección de un problema.
-   `Removed` --- eliminación.
-   `Documentation` --- cambios relevantes en documentación.

## Historial

### 2026-10-28

#### Changed

-   En `feat-cta-icon`, el CTA fijo de `index.html` adopta una presentación
    circular de `3rem` hasta `767px`, con ícono de ticket de `1.5rem` y
    separación derecha de `1.5rem`. El texto «COMPRAR TICKETS» se oculta
    visualmente y permanece disponible para lectores de pantalla.
    Entre `768px` y `1199px` conserva texto visible y centrado; desde
    `1200px`, texto visible y ubicación a la derecha. Se mantienen el destino
    `#tickets`, el observer y la separación inferior con área segura.
-   El ajuste previo de `feat-redesign-sections` alinea los márgenes laterales
    de Términos y Privacidad con `--site-content-gutter` y reduce su padding
    superior de `8rem` a `4rem`. Se agrega separación después de los subtítulos
    de Privacidad y se desactivan los CTA fijos de compra de ambas páginas,
    conservando su marcado comentado.
-   Archivos de implementación del CTA: `scss/elements/_go-to-tickets.scss`,
    `css/estilos.css` y `css/estilos.css.map`. Los ajustes de legales afectan
    además `pages/terminos_y_condiciones.html`,
    `pages/politica_de_privacidad.html`, `scss/sections/_proteccion.scss` y
    `scss/sections/_privacidad.scss`.

#### Documentation

-   Se actualizan `01-proyecto-resumen.md`, `02-bloque-hero-tickets.md` y
    `CHANGELOG.md` para reflejar la etapa `feat-cta-icon` y los tres rangos de
    presentación del CTA. Se conserva el cierre anterior de Nosotros y Puestas.
-   Se registra la valoración visual favorable informada por el usuario,
    distinguiéndola de las pruebas completas de responsive y accesibilidad
    todavía pendientes. Esta actualización no registra un despliegue en
    producción.

### 2026-10-27

#### Changed

-   Nosotros incorpora un cálculo de altura para la grilla de dos columnas
    entre `768px` y `1199px`, hasta `900px` de alto. `ResizeObserver` mide la
    introducción y CSS asigna el espacio restante a ambas filas, con mínimos
    de `22rem` y `20rem`. La segunda fila continúa mediante scroll normal.
-   Se recupera presencia del título y las frases de Nosotros, se conserva
    la sincronización del ancla y se oculta únicamente la explicación
    secundaria hasta `640px` de alto dentro del rango intermedio.
-   El mínimo del loader pasa de tres a dos segundos antes de su transición
    de salida; se conserva la salvaguarda de doce segundos.
-   Se actualizan la agenda de `data/tickets.json` y sus imágenes para las
    próximas fechas, sin modificar la lógica de filtrado de `tickets.js`.

#### Fixed

-   Se agrega una corrección para entradas iniciales mobile, hasta `767px`,
    con destino a Tickets, Nosotros, Puestas o Contacto. Espera el renderizado
    de la agenda, sus imágenes y las fuentes antes de reposicionar el ancla;
    se cancela ante interacción del usuario. `tickets.js` expone la promesa
    de renderizado como `window.polentaTicketsReady`; la corrección vive en
    `index.js` y conserva la navegación interna y las correcciones previas.
-   El observer del CTA descuenta la altura real de `.header__fixed` mediante
    un `rootMargin` superior negativo, para evitar que permanezca oculto al
    navegar a Nosotros hasta efectuar un scroll adicional.

#### Documentation

-   El usuario confirma en iPhone, mediante una preview de Netlify, la llegada
    correcta a los títulos desde las páginas legales. Observa aproximadamente
    un segundo hasta el posicionamiento final: se acepta temporalmente y no
    se registra como tiempo fijo ni garantizado.
-   Se da por cerrada por ahora la etapa de rediseño de Nosotros y Puestas,
    pendiente del feedback de Mica. El análisis de carga de tickets e imágenes
    queda para otro chat y otra rama. Se conservan las comprobaciones
    responsive y de accesibilidad que aún no cuentan con validación completa.
-   La actualización de cierre afecta `01-proyecto-resumen.md`,
    `04-section-tickets.md`, `06-section-nosotros.md`, `07-section-puestas.md`
    y `CHANGELOG.md`. No modifica código ni registra un despliegue de producción.
-   Se crean `06-section-nosotros.md` y `07-section-puestas.md` para describir
    el estado vigente de los rediseños incorporados durante
    `feat-redesign-sections`: cards, interacción, composición desktop compacta
    y cálculo intermedio de Nosotros; distribución Flexbox, navegación,
    indicadores y autoplay del carrusel de Puestas.
-   Se distinguen implementación, validaciones informadas por el usuario y
    pruebas pendientes. La evaluación visual inicial favorable de Nosotros
    no se presenta como validación completa de responsive o accesibilidad.
-   Se actualizan resumen, referencias para agentes, fuente de datos de
    Tickets, comportamiento del CTA y duración vigente del loader. Las
    entradas históricas se conservan con los valores que regían entonces.
-   Archivos documentales afectados: `01-proyecto-resumen.md`,
    `02-bloque-hero-tickets.md`, `05-loader.md`, `06-section-nosotros.md`,
    `07-section-puestas.md`, `AGENTS.md` y `CHANGELOG.md`.
-   Referencias de implementación: `index.html`, `index.js`, `puestas.js`,
    `scss/sections/_nosotros.scss`, `scss/sections/_puestas.scss`,
    `scss/_general.scss`, `scss/elements/_go-to-tickets.scss`,
    `css/estilos.css`, `css/estilos.css.map`, `data/tickets.json` e
    `imgs/tickets/`. Esta entrada no registra un despliegue en producción.

### 2026-10-14

#### Added

-   Se integró el loader inicial para `feat-hero-assets`. Bloquea contenido,
    scroll e interacción mientras espera el GIF, el primer frame de las dos
    animaciones de Hero y una única variante activa del video de fondo.
-   Se incorporaron variantes responsive del fondo compartido Hero + Tickets:
    vertical mobile, intermedia y desktop, cada una con WebM y MP4 como
    alternativas de compatibilidad. Las variantes inactivas no se precargan.
-   Se agregaron posters estáticos para representar la animación del
    asterisco antes de que su video esté disponible.

#### Changed

-   El loader permanece al menos tres segundos, utiliza una transición de
    salida y cuenta con una salvaguarda de doce segundos ante recursos que no
    responden. Tickets permanece fuera de esta condición de salida.
-   Las animaciones de Hero comienzan al terminar la transición del loader;
    repiten normalmente y, con `prefers-reduced-motion: reduce`, se
    reproducen una sola vez.
-   Se ajustó la escala y el centrado responsive de logo y asterisco para
    mobile, tablet, desktop y el rango de `992px` a `1199px`.
-   El loader aparece únicamente al entrar a `index.html` sin hash. Las
    entradas a `#hero`, `#tickets`, `#nosotros`, `#puestas` y `#contacto`
    omiten el loader, incluyendo la navegación desde Términos y Privacidad.
-   La navegación a Tickets utiliza un ancla auxiliar para alinear su título
    con la posición de llegada de Nosotros y Puestas respecto de la cabecera
    fija.

#### Fixed

-   Se estabilizó la navegación hacia Contacto ante ajustes posteriores de
    layout en Puestas. Conserva el scroll nativo suave y también corrige una
    entrada directa con `#contacto`.

#### Documentation

-   Se actualizaron las especificaciones del loader, Hero y el bloque Hero +
    Tickets para reflejar la implementación actual y las verificaciones que
    aún quedan pendientes.
-   Áreas afectadas: `index.html`, `index.js`, `scss/sections/_loader.scss`,
    `scss/sections/_animations.scss`, `imgs/assets-mov/`, `imgs/loader/`,
    `imgs/video/`, `01-proyecto-resumen.md`,
    `02-bloque-hero-tickets.md`, `03-section-hero.md`,
    `04-section-tickets.md`, `05-loader.md` y `CHANGELOG.md`.

-   Áreas afectadas por los ajustes de navegación: `index.html`, `index.js`,
    `scss/_general.scss`, `scss/sections/_tickets.scss`, `css/estilos.css`,
    `01-proyecto-resumen.md`, `02-bloque-hero-tickets.md`,
    `04-section-tickets.md`, `05-loader.md` y `CHANGELOG.md`.

### 2026-10-12

#### Changed

-   Se integró Hero antes de Tickets en `index.html`, dentro del bloque
    compartido con un único video de fondo.
-   Se incorporó la superposición de las animaciones de asterisco y logo en
    Hero mediante la implementación de estilos actual.
-   Se ajustaron las fuentes de las animaciones para utilizar MOV/HEVC con
    alternativas WebM, y se retiró el uso de `mix-blend-mode: screen` en esas
    capas para resolver los fondos negros observados.

#### Documentation

-   Se actualizó la documentación funcional de `feat-hero-assets` para
    reflejar la integración actual de Hero, Tickets y sus assets de animación.
-   Se registró la validación de reproducción realizada en dispositivos Apple
    y se mantuvo pendiente la validación en los demás navegadores objetivo.
-   Se mantuvo el loader inicial como funcionalidad definida pero no
    implementada; las animaciones actuales todavía no están coordinadas con su
    transición de salida.
-   Áreas afectadas: `01-proyecto-resumen.md`,
    `02-bloque-hero-tickets.md`, `03-section-hero.md`,
    `04-section-tickets.md`, `05-loader.md` y `CHANGELOG.md`.

### 2026-10-10

#### Documentation

-   Se actualizó la documentación funcional de la rama `feat-hero-assets` para
    reflejar la arquitectura prevista y el estado actual de implementación, sin
    registrar como terminadas las funcionalidades que continúan en desarrollo.
-   Se actualizó el resumen general del proyecto con el recorrido previsto
    Loader → Hero animado → Tickets → Nosotros, la relación visual entre Hero y
    Tickets y el estado de sus implementaciones pendientes.
-   Se documentó el bloque compartido Hero + Tickets con un único video de
    fondo, scroll continuo del documento y sin sistema de scroll interno
    independiente.
-   Se documentaron las animaciones de Hero: asterisco azul y logo tipográfico,
    sus assets disponibles y las validaciones técnicas todavía pendientes.
-   Se actualizaron las especificaciones de Tickets, conservando su lógica de
    carga, filtrado, renderizado dinámico y comportamiento responsive
    actualmente verificado.
-   Se creó la especificación funcional del loader inicial, incluyendo sus
    requisitos confirmados, el estado pendiente de implementación y la
    propuesta técnica aún no aprobada para sus recursos críticos.
-   Áreas afectadas: `01-proyecto-resumen.md`,
    `02-bloque-hero-tickets.md`, `03-section-hero.md`,
    `04-section-tickets.md` y `05-loader.md`.

### 2026-10-03

#### Fixed

-   Se definió el contenedor `<picture>` del carrusel de Puestas como bloque
    de ancho completo con relación `16 / 9` y se fijó la altura automática de
    sus imágenes. Esto preserva la proporción apaisada y reserva el espacio
    antes de que cargue la variante responsive, evitando desplazar el ancla de
    Contacto en todos los breakpoints.
-   Se incorporó una corrección temporal del ancla de Contacto cuando cambia
    la altura de Puestas durante la primera navegación, para cubrir ajustes de
    layout posteriores a la carga inicial.
-   Áreas afectadas: `index.js`, `scss/sections/_puestas.scss` y
    `css/estilos.css`.

-   Los enlaces de la navbar hacia Nosotros, Puestas y Contacto ahora apuntan
    al punto medio del padding superior de cada section. Así se conserva parte
    del fondo por encima del título y el espacio para la cabecera fija.
-   Tickets se mantiene fuera del alcance de este cambio y conserva su destino
    de navegación anterior.
-   Áreas afectadas: `index.html`, `scss/_general.scss`,
    `scss/sections/_background.scss` y `css/estilos.css`.

-   Se reservaron las proporciones de las imágenes del carrusel de Puestas
    antes de su carga diferida para evitar que desplacen el destino de Contacto
    durante el primer uso de la navegación.
-   Área afectada: `index.html`.

#### Changed

-   Las imágenes de las cards de Nosotros y del carrusel de Puestas ahora usan
    variantes responsive con `<picture>`, `srcset` y `sizes`: mobile hasta
    `575px`, tablet hasta `1199px` y desktop como fallback. Se mantienen la
    carga diferida, la decodificación asíncrona y las dimensiones reservadas.
-   Área afectada: `index.html`.

#### Documentation

-   Se formalizó la estrategia de ramas: desarrollo en ramas de
    funcionalidades, despliegue desde `branch_deploy`, sincronización de
    `main` únicamente después de un período de estabilidad y conservación de
    ramas históricas como referencia.
-   Se definió el formato común de los mensajes de commit y se indicó la
    verificación del número correlativo en todas las ramas.
-   Áreas afectadas: `01-proyecto-resumen.md` y `AGENTS.md`.

### 2026-10-02

#### Changed

-   Hero selecciona y carga una sola variante de video según ancho y
    orientación del viewport: mobile vertical, mobile horizontal, tablet
    horizontal o desktop. La selección se actualiza al cruzar un breakpoint o
    cambiar de orientación, sin precargar las variantes inactivas.
-   Entre `768px` y `1199px` en orientación vertical se reutiliza la
    composición vertical mobile porque no hay un asset vertical específico de
    tablet en `imgs/assets-hero-section`.
-   Áreas afectadas: `index.html`, `index.js` y `03-section-hero.md`.

### 2026-09-30

#### Added

-   Se implementó el loader inicial y el bloque compartido Hero + Tickets.
    El loader espera el GIF, los assets de Hero correspondientes y una única
    variante de video elegida por ancho de viewport; Tickets continúa
    cargando de manera independiente y no condiciona su salida.
-   Hero utiliza la composición unificada `asterisk-blue-logo` en tablet y
    desktop, y `m-asterisk-blue-logo` en mobile. Los recursos de Hero y del
    fondo se actualizan al cruzar los breakpoints responsive.
-   Se garantizó una presencia mínima del loader para que sea perceptible aun
    cuando sus recursos críticos ya estén en caché, y se centraron los assets
    de Hero en ambos ejes sin forzar una relación de aspecto cuadrada en mobile.
-   Se ajustó la presencia mínima del loader a dos segundos.

#### Changed

-   Hero + Tickets ahora utiliza un único video compuesto por breakpoint,
    reemplazando las capas separadas de fondo, asterisco y logo: versión
    vertical bajo `768px` y versión horizontal desde `768px`, ambas con WebM
    y MP4 como alternativas de compatibilidad.
-   Se incorporó el scroll interno sin barra visible entre Hero y Tickets,
    manteniendo el video de fondo durante la transición, y soporte para
    `prefers-reduced-motion` en las animaciones de Hero.
-   Hero y Tickets se separaron en sections independientes. El orden pasó a
    ser Hero, Nosotros, Tickets, Puestas y Contacto; Tickets recuperó su video
    de fondo responsive propio y quedó fuera de la carga crítica del loader.
-   El CTA de Tickets usa un ancla interna y permanece visible en mobile. Hero
    ajusta su área visual al alto disponible debajo de la announcement bar y
    la navbar; el video compuesto llena esa área de forma proporcional y
    centrada, recortando sólo el eje necesario según la relación de aspecto.
-   Áreas afectadas: `index.html`, `index.js`, `scss/sections/_hero.scss` y
    `scss/sections/_tickets.scss`.

#### Documentation

-   Se definió la nueva especificación funcional del loader inicial: recursos
    críticos, bloqueo de contenido, transición de salida y exclusión de
    Tickets como condición de carga.
-   Se definieron la selección responsive del video compartido Hero + Tickets,
    los assets de Hero por dispositivo y el comportamiento ante movimiento
    reducido.
-   Se incorporaron referencias visuales de Figma para Hero mobile y desktop.
-   Áreas afectadas: `01-proyecto-resumen.md`,
    `02-bloque-hero-tickets.md` y `03-section-hero.md`.

-   Se reorganizó la documentación base del proyecto.
-   Se separó el comportamiento compartido de Hero + Tickets de las
    especificaciones particulares de cada section.
-   Se incorporaron reglas explícitas para identificar información que
    todavía no está especificada en la documentación disponible.

## Regla de mantenimiento

Los cambios relevantes deben agregarse al changelog cuando se complete
una modificación del proyecto.

No registrar cambios triviales que no aporten información útil sobre la
evolución del proyecto.
