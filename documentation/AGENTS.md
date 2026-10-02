# Polenta Web — Instrucciones para agentes de desarrollo

## Antes de modificar

Consultar la documentación aplicable y verificar el código existente. Los documentos describen el estado de `main`; no deben usarse para asumir requisitos de experimentos o ramas de funcionalidades nuevas.

## Reglas de trabajo

1. No inventar requisitos ni comportamientos no documentados.
2. Cuando falte información, revisar primero el código y conservar el comportamiento actual si no hay una definición nueva.
3. Si el comportamiento no puede determinarse con seguridad, pedir una definición antes de asumirlo.
4. Al modificar SCSS, regenerar `css/estilos.css` con `npm run build-css` y revisar los cambios generados.
5. No cambiar la lógica de fechas de Tickets sin revisar `tickets.js` y `data/tickets.json`.
6. No separar Hero y Tickets, ni modificar su video o scroll, sin considerar que en el estado base son un único bloque.

## Mantenimiento de documentación

Actualizar el documento correspondiente y `CHANGELOG.md` cuando una modificación cambie de forma relevante el comportamiento, la estructura o una especificación del proyecto.

## Documentos disponibles

- `01-proyecto-resumen.md`: contexto general.
- `02-bloque-hero-tickets.md`: bloque inicial actual.
- `03-section-hero.md`: contenedor Hero actual.
- `04-section-tickets.md`: datos y renderizado de Tickets.
- `CHANGELOG.md`: historial relevante.
