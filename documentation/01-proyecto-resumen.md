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

La versión `feat-hero-assets` incluirá un loader inicial antes de que el
usuario acceda al contenido del sitio.

Mientras esté visible, el contenido permanecerá oculto, el scroll estará
bloqueado y no será posible interactuar con el contenido subyacente.

El loader desaparecerá mediante una transición. Al finalizarla, comenzarán
las dos animaciones de Hero.

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

## 6. Estado actual de feat-hero-assets

### Funcionalidad definida

-   La versión incluirá un loader inicial.
-   El loader ocultará el contenido, bloqueará el scroll e impedirá la
    interacción con el contenido subyacente mientras esté visible.
-   Hero y Tickets estarán visualmente diferenciados y compartirán un
    contenedor general con un único video de fondo.
-   Al finalizar la transición del loader comenzarán las dos animaciones de
    Hero.

### Implementado y verificado

-   `index.html` integra Hero antes de Tickets dentro de un mismo bloque
    `.hero`.
-   El bloque utiliza un único video de fondo, `#hero_bgs`, para Hero y
    Tickets.
-   La lógica de carga y filtrado de Tickets continúa en `tickets.js`.
-   Las animaciones de asterisco y logo están incorporadas como videos
    superpuestos.
-   Los assets integrados están disponibles en `imgs/assets-mov/` en formatos
    MOV y WebM. El fallback del logo se denomina
    `logo-type-changing-vp8.webm`.
-   La reproducción de las animaciones fue validada en dispositivos Apple sin
    los fondos negros que presentaba la implementación anterior.

### Parcialmente implementado

-   Los estilos de Hero y animaciones contemplan unidades de viewport y
    restricciones de tamaño, pero su comportamiento responsive definitivo
    todavía no fue validado.

### Pendiente de implementación o validación

-   Implementar el loader inicial.
-   Validar el comportamiento responsive específico de las animaciones.
-   Validar la reproducción de los videos en los navegadores objetivo, además
    de los dispositivos Apple ya comprobados.
-   Validar la continuidad visual del video compartido durante el scroll.
-   Aprobar la definición técnica de los recursos críticos del loader.

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

El archivo `tickets.js` contiene la información utilizada para
renderizar los tickets.

El comportamiento específico de Tickets está documentado en:

`04-section-tickets.md`

## 9. Documentación del proyecto

La documentación se organiza separando:

-   contexto general del proyecto;
-   comportamiento compartido entre Hero y Tickets;
-   comportamiento específico de Hero;
-   comportamiento específico de Tickets;
-   comportamiento específico del loader;
-   historial de cambios;
-   instrucciones de trabajo para agentes de desarrollo.

### Documentos

-   `01-proyecto-resumen.md` --- contexto general.
-   `02-bloque-hero-tickets.md` --- comportamiento compartido de Hero +
    Tickets.
-   `03-section-hero.md` --- especificaciones propias de Hero.
-   `04-section-tickets.md` --- especificaciones propias de Tickets.
-   `05-loader.md` --- especificaciones funcionales del loader inicial.
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

-   duración mínima del loader;
-   duración y efecto visual exactos de su transición;
-   tiempo máximo de espera ante errores de carga;
-   comportamiento ante recursos incompatibles;
-   detalles de implementación responsive del loader;
-   estructura completa de carpetas y archivos;
-   nombres de todos los archivos CSS/HTML/JS;
-   comportamiento detallado del header y navbar;
-   comportamiento de las sections Nosotros, Puestas y Contacto;
-   reglas exactas para considerar una fecha como obsoleta;
-   proveedor o formato de los links de compra.

No se deben inferir estas reglas a partir de este documento. Cuando sea
necesario modificar alguno de estos aspectos, primero debe verificarse
en el código o definirse explícitamente.
