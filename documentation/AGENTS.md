# Polenta Web --- Instrucciones para agentes de desarrollo

## 1. Contexto

Polenta Web es un sitio de Fiesta Polenta.

El proyecto está construido utilizando únicamente HTML, CSS y
JavaScript, con enfoque mobile first y responsive. 

El contexto general del proyecto está documentado en:

`01-proyecto-resumen.md`

## 2. Documentación de referencia

Antes de modificar una parte del proyecto, consultar el documento
correspondiente:

-   `01-proyecto-resumen.md` --- contexto general.
-   `02-bloque-hero-tickets.md` --- comportamiento compartido de Hero +
    Tickets.
-   `03-section-hero.md` --- características propias de Hero.
-   `04-section-tickets.md` --- características propias de Tickets.
-   `CHANGELOG.md` --- evolución relevante del proyecto.

## 3. Regla principal

No inventar requisitos ni comportamientos que no estén documentados.

Cuando una modificación dependa de información que no aparece en la
documentación:

1.  verificar primero el código existente;
2.  conservar el comportamiento actual cuando sea posible;
3.  si el comportamiento requerido no puede determinarse, pedir una
    definición antes de asumirla.

## 4. Hero + Tickets

Hero y Tickets forman parte de un mismo bloque con video de fondo
compartido.

No modificar de manera aislada el comportamiento del scroll, el
contenedor o el video de fondo sin considerar la relación entre ambas
sections.

## 5. Tickets

La información utilizada para renderizar los tickets se encuentra en
`tickets.js`.

Las fechas futuras se agregan manualmente y las fechas obsoletas se
quitan mediante JavaScript.

No cambiar la lógica de fechas sin verificar primero el comportamiento
existente.

## 6. Documentación

Cuando una implementación cambie de forma relevante el comportamiento
del proyecto, actualizar `CHANGELOG.md`.

Si una modificación cambia una especificación documentada, actualizar
también el documento `.md` correspondiente.

## 7. Alcance

Estas instrucciones se basan exclusivamente en la documentación
disponible del proyecto. No presuponen una arquitectura de carpetas,
framework, librería o herramienta que no esté documentada.
