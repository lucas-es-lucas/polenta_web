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

El loader permanece visible hasta que sus recursos críticos están preparados.

El asset visual definido para el loader es:

`imgs/loader/Loader-Logo.gif`

El loader desaparece mediante una transición.

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

Actualmente no existe un loader integrado. Las animaciones de Hero declaran
reproducción automática en la implementación actual, por lo que todavía no
hay una coordinación implementada entre la transición de salida del loader y
el inicio de esas animaciones.

## 4. Propuesta técnica pendiente de aprobación

Se propone considerar como recursos críticos del loader:

-   el asset visual del loader;
-   el video de fondo compartido entre Hero y Tickets;
-   los recursos necesarios para iniciar correctamente las dos animaciones de
    Hero.

La condición de preparación debe permitir iniciar la reproducción sin esperar
la descarga completa del archivo. El evento o mecanismo técnico utilizado para
verificar esa condición se definirá durante la implementación y deberá
validarse en los navegadores objetivo.

Esta definición de recursos críticos es una propuesta técnica y no constituye
una especificación aprobada definitivamente.

## 5. Estado actual de implementación

### Definido

-   El loader aparece antes del contenido del sitio.
-   El contenido, el scroll y la interacción permanecen bloqueados mientras el
    loader está visible.
-   El loader desaparece mediante una transición.
-   Al finalizar la transición comienzan las animaciones de Hero.
-   Tickets no debe retrasar la salida del loader.
-   El asset visual definido es `imgs/loader/Loader-Logo.gif`.

### Pendiente de implementación

-   La estructura HTML del loader.
-   Los estilos del loader.
-   La lógica JavaScript de carga, bloqueo y salida.
-   La integración del loader con los recursos de Hero.
-   La validación de disponibilidad e integración del asset definido en esta
    rama.

### Pendiente de aprobación técnica

-   La lista definitiva de recursos críticos.
-   El criterio técnico exacto para determinar que cada video está preparado
    para comenzar su reproducción.

## 6. Comportamientos no especificados

Todavía no se definen:

-   duración mínima del loader;
-   duración y efecto visual exactos de la transición;
-   tiempo máximo de espera ante errores de carga;
-   comportamiento ante recursos incompatibles;
-   detalles de implementación responsive del loader.

No deben incorporarse decisiones sobre estos aspectos sin una definición
explícita.
