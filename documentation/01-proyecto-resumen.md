# Polenta Web --- Resumen del proyecto

## 1. Identificación

Proyecto web de Fiesta Polenta.

El proyecto se trabaja en VS Code y está construido utilizando
únicamente HTML, CSS y JavaScript.

## 2. Principios técnicos

-   Mobile first.
-   Responsive.
-   HTML, CSS y JavaScript sin frameworks indicados en la documentación
    disponible.

## 3. Estructura general prevista

La nueva versión del sitio tendrá la siguiente estructura:

-   Loader inicial.
-   Header.
-   Announcement bar dentro del header.
-   Navbar dentro del header.
-   Hero animado.
-   Tickets.
-   Nosotros.
-   Puestas.
-   Contacto.
-   Footer.

Las cinco áreas principales de contenido, en orden de visualización, serán:

1.  Hero.
2.  Tickets.
3.  Nosotros.
4.  Puestas.
5.  Contacto.

## 4. Loader inicial

La versión `feat-hero-assets` incorpora un loader inicial antes de que el
usuario acceda al contenido del sitio.

Mientras esté visible, el contenido permanecerá oculto, el scroll estará
bloqueado y no será posible interactuar con el contenido subyacente.

El loader permanece al menos dos segundos antes de desaparecer mediante una
transición. Al finalizarla, comienzan las dos animaciones de Hero.

El loader sólo se muestra al acceder a `index.html` sin hash. Las entradas
directas a las sections principales mediante `#hero`, `#tickets`, `#nosotros`,
`#puestas` o `#contacto` omiten el loader para que las navegaciones desde las
páginas legales lleguen directamente a su destino.

La carga, obtención o renderizado de Tickets no debe retrasar la salida del
loader.

El comportamiento funcional detallado, el estado de implementación y las
decisiones técnicas pendientes se documentan en:

`05-loader.md`

## 5. Arquitectura de Hero y Tickets

Hero y Tickets estarán visualmente diferenciados, pero compartirán un
contenedor general y un único video de fondo.

El usuario verá primero las dos animaciones de Hero: asterisco y logo. Al
continuar el scroll, llegará a Tickets sin interrumpir visualmente el video de
fondo compartido. Después de Tickets comenzará la section Nosotros.

La lógica actual de Tickets se conserva. Su contenido se renderiza mediante
`tickets.js` y no debe retrasar la salida del loader.

## 6. Estado actual del proyecto

La base de Hero + Tickets proviene de `feat-hero-assets`. El estado descrito
a continuación incluye el rediseño de Nosotros y Puestas de la rama
`feat-redesign-sections`, revisado el 2026-10-27; no implica que esos cambios
ya estén publicados en producción.

### Funcionalidad definida

-   La versión incorpora un loader inicial.
-   El loader ocultará el contenido, bloqueará el scroll e impedirá la
    interacción con el contenido subyacente mientras esté visible.
-   Hero y Tickets estarán visualmente diferenciados y compartirán un
    contenedor general con un único video de fondo.
-   Al finalizar la transición del loader comenzarán las dos animaciones de
    Hero.
-   La salida del loader no espera la carga, obtención ni renderizado de
    Tickets.

### Implementado y verificado

-   `index.html` integra Hero antes de Tickets dentro de un mismo bloque
    `.hero`.
-   El bloque utiliza un único video de fondo, `#hero_bgs`, para Hero y
    Tickets.
-   La lógica de carga y filtrado de Tickets continúa en `tickets.js`.
-   Las animaciones de asterisco y logo están incorporadas como videos
    superpuestos.
-   Las animaciones usan MOV/HEVC con alternativa WebM y se inician una vez
    terminada la transición del loader. Con `prefers-reduced-motion: reduce`,
    se reproducen una vez y no repiten el loop.
-   El asterisco utiliza un poster PNG estático mientras su video se prepara.
-   Se selecciona y carga dinámicamente una sola variante del video de fondo:
    vertical mobile hasta `575px` en portrait, variante intermedia hasta
    `1199px` y variante desktop desde `1200px`. Cada variante ofrece WebM y
    MP4.
-   El loader espera el GIF, la variante de fondo activa y el primer frame de
    las dos animaciones; cuenta además con una salvaguarda de doce segundos
    para evitar que el sitio quede bloqueado ante un recurso pendiente.
-   El loader se muestra únicamente al entrar a `index.html` sin hash. Las
    entradas a `#hero`, `#tickets`, `#nosotros`, `#puestas` y `#contacto`
    omiten el loader.
-   Se ajustó la composición responsive de las animaciones para mobile,
    tablet, desktop y el rango intermedio de `992px` a `1199px`.

### Pendiente de implementación o validación

-   Validar la reproducción de los videos en los navegadores objetivo, además
    de los dispositivos Apple ya comprobados.
-   Validar la continuidad visual del video compartido durante el scroll.
-   Revisar el comportamiento final de carga, renderizado y continuidad visual
    del bloque Hero + Tickets al navegar directamente hacia sus sections.

### Rediseño de Nosotros y Puestas implementado

-   Nosotros presenta cuatro cards con imágenes responsive, títulos y paneles
    que se revelan mediante hover o foco. La grilla utiliza una, dos o cuatro
    columnas según el ancho disponible.
-   Entre `768px` y `1199px`, con hasta `900px` de alto, Nosotros calcula la
    altura compartida de ambas filas a partir del espacio vertical restante.
    `ResizeObserver` mide la introducción; CSS administra el presupuesto y los
    mínimos. La segunda fila continúa mediante scroll normal.
-   Desde `1200px`, la composición compacta de Nosotros conserva un cálculo
    independiente para las cuatro cards de una sola fila.
-   Puestas utiliza una section de `100svh` con mínimo de `35rem`, una
    introducción de altura natural y un carrusel que recibe el espacio
    restante mediante Flexbox. Incluye navegación, indicadores y autoplay.
-   El CTA fijo descuenta del área observada la altura real del header para
    reaparecer al navegar hacia Nosotros sin exigir un scroll adicional.
-   Se recibió una evaluación visual inicial favorable de la implementación
    de Nosotros. La matriz completa de viewports, las interacciones y la
    accesibilidad permanecen pendientes de validación sistemática.

Las especificaciones, límites y comprobaciones pendientes están en
[Nosotros](06-section-nosotros.md) y [Puestas](07-section-puestas.md).

### Cierre de etapa y trabajo posterior

El usuario da por cerrada por ahora esta etapa del rediseño de Nosotros y
Puestas, a la espera del feedback de Mica, la diseñadora. Este cierre no
equivale a una aprobación final de diseño ni a una validación completa de la
matriz responsive y de accesibilidad.

La navegación desde las páginas legales hacia Tickets, Nosotros, Puestas y
Contacto fue probada por el usuario en iPhone mediante una preview de Netlify
y llega correctamente a los títulos después de la corrección inicial mobile.
En esa prueba se observó una demora aproximada de un segundo hasta el
posicionamiento final. Se acepta temporalmente; es una observación de esa
prueba, no un tiempo fijo ni garantizado.

El análisis de la carga de tickets e imágenes y de esta demora queda para
otro chat y otra rama. No se optimiza la carga de `index.html` dentro de esta
etapa. El mecanismo vigente está documentado en
[04-section-tickets.md](04-section-tickets.md).

## 7. Orden de visualización previsto

Al cargar el sitio, el orden visual será:

1.  Loader inicial.
2.  Announcement bar y navbar.
3.  Section Hero animada.
4.  Section Tickets, con continuidad del video de fondo compartido.
5.  Section Nosotros.
6.  Section Puestas.
7.  Section Contacto.
8.  Footer.

## 8. Tickets

La section Tickets contiene los tickets, cada uno con:

-   una imagen;
-   un link de compra.

La cantidad de tickets varía durante la semana.

Las fechas futuras se agregan manualmente y las fechas obsoletas se
quitan mediante JavaScript.

`data/tickets.json` contiene la agenda. `tickets.js` la carga, filtra por
fecha y renderiza los tickets.

El comportamiento específico de Tickets está documentado en:

`04-section-tickets.md`

## 9. Documentación del proyecto

La documentación se organiza separando:

-   contexto general del proyecto;
-   comportamiento compartido entre Hero y Tickets;
-   comportamiento específico de Hero;
-   comportamiento específico de Tickets;
-   comportamiento específico del loader;
-   comportamiento responsive e interacción de Nosotros y Puestas;
-   historial de cambios;
-   instrucciones de trabajo para agentes de desarrollo.

### Documentos

-   `01-proyecto-resumen.md` --- contexto general.
-   `02-bloque-hero-tickets.md` --- comportamiento compartido de Hero +
    Tickets.
-   `03-section-hero.md` --- especificaciones propias de Hero.
-   `04-section-tickets.md` --- especificaciones propias de Tickets.
-   `05-loader.md` --- especificaciones funcionales del loader inicial.
-   [06-section-nosotros.md](06-section-nosotros.md) --- cards y composición responsive de Nosotros.
-   [07-section-puestas.md](07-section-puestas.md) --- composición vertical y carrusel de Puestas.
-   `CHANGELOG.md` --- cambios relevantes del proyecto.
-   `AGENTS.md` --- reglas de trabajo para agentes de desarrollo.

## 10. Estrategia de ramas

El trabajo operativo con Git se rige por las siguientes ramas:

-   `branch_deploy` representa la versión de producción publicada en
    `https://fiestapolenta.com/`.
-   Las ramas de funcionalidades se utilizan para desarrollar y validar
    cambios nuevos. Una vez aprobados por Polenta, se integran en
    `branch_deploy`.
-   `main` es la rama estable de referencia. Se actualiza únicamente al
    integrar `branch_deploy` después de un período de estabilidad posterior a
    una publicación oficial.
-   Las ramas que contienen versiones anteriores del sitio se conservan como
    referencia histórica y no integran el flujo habitual de despliegue.

Las reglas operativas, los merges permitidos y el formato de los commits están
definidos en `AGENTS.md`.

## 11. Información no especificada

La documentación disponible no define, entre otros aspectos:

-   estructura completa de carpetas y archivos;
-   nombres de todos los archivos CSS/HTML/JS;
-   comportamiento detallado del header y navbar;
-   comportamiento completo de Contacto;
-   proveedor o formato de los links de compra.

Nosotros y Puestas cuentan con documentos propios. La regla vigente de
filtrado de fechas está detallada en `04-section-tickets.md`.

No se deben inferir estas reglas a partir de este documento. Cuando sea
necesario modificar alguno de estos aspectos, primero debe verificarse
en el código o definirse explícitamente.
