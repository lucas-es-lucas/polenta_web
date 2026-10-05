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

### 2026-10-05

#### Fixed

-   Los enlaces internos hacia Hero, Nosotros, Tickets, Puestas y Contacto
    conservan la navegación por hash sin mostrar el loader. Esto incluye el
    logo de la navbar, el CTA Comprar Tickets y los enlaces equivalentes desde
    las páginas legales.
-   El CTA Comprar Tickets queda visible desde la carga en mobile y, desde
    tablet, aparece únicamente después de superar el final de Tickets. La
    regla toma como referencia la section Tickets ya reubicada después de
    Nosotros y no la visibilidad de Hero.
-   La navbar respeta el orden de visualización de las sections: Nosotros,
    Tickets, Puestas y Contacto. El mismo orden y los destinos por hash se
    aplican en las páginas de Términos y Condiciones y Política de Privacidad.
-   Áreas afectadas: `index.html`, `index.js`, páginas legales y estilos del
    loader.

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
