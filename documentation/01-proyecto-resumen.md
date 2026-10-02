# Polenta Web — Resumen del proyecto

## Identificación

Sitio web de Fiesta Polenta. El proyecto está construido con HTML, JavaScript y estilos SCSS compilados a CSS.

## Principios técnicos

- Enfoque mobile first y responsive.
- Los estilos fuente están en `scss/` y se compilan en `css/estilos.css` con `npm run build-css`.
- No se incorporan dependencias o comportamientos nuevos sin verificarlos primero en el código.

## Estructura actual del sitio

La página principal contiene:

- header, announcement bar y navbar;
- un bloque inicial `.hero`;
- las sections Nosotros, Puestas y Contacto;
- footer;
- un acceso fijo «COMPRAR TICKETS».

En el estado actual, Tickets forma parte del bloque `.hero`.

## Bloque Hero + Tickets actual

El bloque `.hero` contiene el video de fondo, una capa oscura y el contenido de Tickets. El video usa `imgs/video/bg-tickets.webm` con `imgs/video/bg-tickets.mp4` como alternativa.

La información funcional y visual de este bloque está en `02-bloque-hero-tickets.md`. La lógica de Tickets está en `04-section-tickets.md`.

## Documentación del proyecto

- `01-proyecto-resumen.md`: contexto general y estructura actual.
- `02-bloque-hero-tickets.md`: comportamiento del bloque inicial actual.
- `03-section-hero.md`: especificación del contenedor Hero actual.
- `04-section-tickets.md`: datos y renderizado de Tickets.
- `CHANGELOG.md`: cambios relevantes.
- `AGENTS.md`: reglas de trabajo para agentes de desarrollo.

## Información no especificada

La documentación no reemplaza al código. Antes de modificar detalles no documentados —por ejemplo, layout completo de otras sections, dimensiones de assets o integraciones externas— hay que verificarlos en la implementación actual o pedir una definición.
