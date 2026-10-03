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

## 3. Estructura general del sitio

El sitio consta de:

-   Header.
-   Announcement bar dentro del header.
-   Navbar dentro del header.
-   un bloque inicial Hero + Tickets y 4 sections posteriores.
-   Footer.
-   Loader inicial.

Las sections son:

1.  Hero (dentro del bloque inicial)
2.  Tickets (dentro del bloque inicial)
3.  Nosotros
4.  Puestas
5.  Contacto

## 4. Loader inicial

El loader se visualiza antes que el contenido del sitio.

Mientras está visible:

-   el contenido del sitio permanece oculto;
-   no se permite el scroll;
-   no se puede interactuar con el contenido subyacente.

El loader permanece visible hasta que cargan sus recursos críticos: el
asset del loader y la variante de video de fondo que corresponde al viewport
actual. Permanece visible al menos dos segundos y luego desaparece mediante
una transición.

La carga, obtención o renderizado de Tickets no debe retrasar la salida del
loader. Esta regla busca evitar que una demora en Tickets bloquee la entrada
al sitio.

El asset visual definido para esta versión es:

-   `imgs/loader/Loader-Logo.gif`

Al finalizar la transición del loader comienzan las animaciones de Hero.

## 5. Hero y Tickets

Hero y Tickets son sections independientes dentro de un mismo bloque
scrollable, con un único video de fondo compartido. Hero superpone el
asterisco y el logo animados; Tickets no. La carga y el renderizado de los
tickets no forma parte de los recursos críticos del loader.

## 6. Orden de visualización

Al cargar el sitio:

1.  Se muestra el loader.
2.  Se muestra la section Hero.
3.  Al hacer scroll dentro del bloque inicial, se visualiza Tickets sobre el
    mismo video de fondo.
4.  Al finalizar ese bloque, se visualizan las sections Nosotros, Puestas y
    Contacto.
6.  Finalmente se visualiza el footer.

## 7. Tickets

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

## 8. Documentación del proyecto

La documentación se organiza separando:

-   contexto general del proyecto;
-   comportamiento compartido entre Hero y Tickets;
-   comportamiento específico de Hero;
-   comportamiento específico de Tickets;
-   historial de cambios;
-   instrucciones de trabajo para agentes de desarrollo.

### Documentos

-   `01-proyecto-resumen.md` --- contexto general.
-   `02-bloque-hero-tickets.md` --- comportamiento compartido de Hero +
    Tickets.
-   `03-section-hero.md` --- especificaciones propias de Hero.
-   `04-section-tickets.md` --- especificaciones propias de Tickets.
-   `CHANGELOG.md` --- cambios relevantes del proyecto.
-   `AGENTS.md` --- reglas de trabajo para agentes de desarrollo.

## 9. Estrategia de ramas

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

## 10. Información no especificada

La documentación disponible no define, entre otros aspectos:

-   estructura completa de carpetas y archivos;
-   nombres de todos los archivos CSS/HTML/JS;
-   dimensiones o formatos de assets;
-   comportamiento detallado del header y navbar;
-   comportamiento de las sections Nosotros, Puestas y Contacto;
-   reglas exactas para considerar una fecha como obsoleta;
-   proveedor o formato de los links de compra.

No se deben inferir estas reglas a partir de este documento. Cuando sea
necesario modificar alguno de estos aspectos, primero debe verificarse
en el código o definirse explícitamente.
