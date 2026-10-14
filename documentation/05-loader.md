# Polenta Web --- Loader inicial

## 1. Propósito

El loader inicial se muestra antes del contenido del sitio en la versión
`feat-hero-assets`.

Su finalidad es controlar la entrada al sitio hasta que los recursos críticos
definidos para la versión estén preparados.

## 2. Requisitos funcionales confirmados

El loader aparece antes del contenido del sitio.

Mientras está visible:

-   el contenido del sitio permanece oculto;
-   el scroll está bloqueado;
-   no se puede interactuar con el contenido subyacente.

El loader permanece visible hasta que sus recursos críticos están preparados y
cumple una duración mínima de tres segundos.

El asset visual definido para el loader es:

`imgs/loader/Loader-Logo.gif`

El loader desaparece mediante una transición de opacidad.

Una vez finalizada la transición, comienzan las dos animaciones de Hero:

-   asterisco;
-   logo.

La carga, obtención y renderizado de Tickets no debe retrasar la salida del
loader.

## 3. Relación con Hero y Tickets

La arquitectura actual de `feat-hero-assets` contiene:

-   un video de fondo compartido entre Hero y Tickets;
-   una animación de asterisco;
-   una animación de logo.

Hero y Tickets estarán visualmente diferenciados, pero compartirán un
contenedor general y un único video de fondo.

Tickets no forma parte de la condición de salida del loader.

El loader está integrado en el marcado, los estilos y la lógica inicial de
`index.js`. Al finalizar su transición, inicia las animaciones de Hero.

## 4. Recursos críticos e implementación

Los recursos críticos del loader son:

-   el asset visual del loader;
-   una única variante activa del video de fondo compartido entre Hero y
    Tickets;
-   los primeros frames de las dos animaciones de Hero.

La variante de fondo se decide antes de iniciar la espera: vertical mobile
hasta `575px` en orientación portrait, variante intermedia hasta `1199px` y
desktop desde `1200px`. Para cada variante se declaran WebM y MP4 como
alternativas de compatibilidad. Las variantes inactivas no se insertan en el
DOM ni se precargan.

La preparación se considera cumplida al recibir `loadeddata`, es decir, cuando
el primer frame puede mostrarse; no se espera la descarga completa de los
videos. Ante un error de recurso se permite continuar y, si alguna solicitud
queda pendiente sin informar error, una salvaguarda de doce segundos libera el
sitio.

El loader sólo se activa al entrar a `index.html` sin hash. Las entradas
directas a `#hero`, `#tickets`, `#nosotros`, `#puestas` y `#contacto` lo
omiten. Esto permite que la navegación desde páginas internas llegue al
destino sin reproducir la carga inicial.

## 5. Estado actual de implementación

### Implementado

-   El loader aparece antes del contenido del sitio.
-   El contenido, el scroll y la interacción permanecen bloqueados mientras el
    loader está visible.
-   El loader desaparece mediante una transición.
-   Al finalizar la transición comienzan las animaciones de Hero.
-   Tickets no debe retrasar la salida del loader.
-   El asset visual definido es `imgs/loader/Loader-Logo.gif`.
-   La duración mínima es de tres segundos.
-   La transición de salida es de opacidad y, al finalizar, inicia las
    animaciones de Hero.
-   La espera contempla el GIF, la variante activa de fondo y los primeros
    frames de asterisco y logo, sin incluir Tickets.
-   Existe una salvaguarda de doce segundos para evitar bloqueo permanente.
-   El loader aparece únicamente al entrar a `index.html` sin hash. Las
    entradas a `#hero`, `#tickets`, `#nosotros`, `#puestas` y `#contacto`
    omiten el loader.

## 6. Comportamientos no especificados

Continúa pendiente validar el comportamiento de recursos incompatibles y la
reproducción en los navegadores objetivo. Estas verificaciones no deben
impedir la salida del loader ni reintroducir Tickets en sus recursos críticos.
