---
name: geo-semanal
description: Flujo GEO de Fiesta Polenta* — validar un tickets.json nuevo, preparar la entrega semanal para Mica, armar el zip de una versión nueva y verificar el sitio publicado. Usar cuando se pida actualizar el GEO semanal, validar tickets.json, cargar una ciudad nueva, armar el zip del sitio o verificar la publicación.
---

# GEO semanal — Fiesta Polenta*

Fuente de verdad: `documentation/08-flujo-geo.md`. Leerlo si algo de esta skill no alcanza. Si hay diferencia, rige ese documento.

## Reglas (de AGENTS.md; no se saltean)

- No modificar, crear, eliminar ni renombrar archivos sin autorización expresa del usuario. Los comandos de abajo que escriben archivos (`geo:ciudad`, `geo:zip`, `geo:preparar`) cuentan: pedir autorización antes de correrlos.
- No ejecutar operaciones Git de escritura (add, commit, push, merge, cambios de rama). Los commits los hace Lucas, con el formato `AAAAMMDD-HHMM-ART: descripción`.
- No pegar el `tickets.json` nuevo en `data/tickets.json`: se valida desde `~/Downloads/tickets.json` (o `--tickets <ruta>`).
- La subida al hosting es manual por CPanel (Mica). No pedir contraseñas ni accesos.
- No inventar requisitos: ante una duda sobre el flujo, consultar.

## Comandos (desde la raíz del proyecto, `npm run <comando>`)

| Comando | Qué hace | Escribe |
| --- | --- | --- |
| `geo:validar` | Valida un tickets.json. Errores bloquean (exit 1). | Nada |
| `geo:ciudad` | Agrega una ciudad (y país) a `scripts/seo-config.json`. | Ese archivo, solo con confirmación |
| `geo:preparar` | Valida, genera y arma `entrega-geo/AAAAMMDD-HHMM/` (index.html, llms.txt, sitemap.xml, tickets.json, LEEME.txt). | Solo `entrega-geo/` |
| `geo:zip` | Versión nueva: corre build-seo en el proyecto y arma `entrega-geo/polenta-web-*.zip` (sin tickets.json ni imgs/tickets/). | index.html, llms.txt, sitemap.xml del proyecto y el zip |
| `geo:verificar` | Verifica el sitio publicado (solo GET/HEAD). | Nada |

Opciones se pasan después de `--` (por ejemplo `npm run geo:validar -- --sin-red`). `--dry-run` existe en `geo:ciudad`, `geo:preparar` y `geo:zip`.

## Publicación semanal

1. Confirmar con Lucas que el `tickets.json` de Mica está en `~/Downloads/tickets.json`.
2. `npm run geo:validar` (solo lectura). Mostrar errores y avisos. Los errores los corrige Mica, salvo «ciudad no está en seo-config.json».
3. Si falta una ciudad: pedir a Lucas los datos (nombre es/en, país, zona horaria) y su autorización; correr `npm run geo:ciudad`, que muestra el texto exacto y pide confirmación. No usar `--si` sin que Lucas lo pida. Los casos especiales (`region`, `display`) se editan a mano.
4. Con autorización: `npm run geo:preparar`. Informar la carpeta creada y los avisos del `LEEME.txt`.
5. Lucas entrega la carpeta a Mica, que sube por CPanel (imágenes primero, luego index.html, llms.txt, sitemap.xml y `tickets.json` en `data/`; no toca robots.txt).
6. Tras publicar: `npm run geo:verificar` y, a mano, Rich Results Test de Google sobre la home (el comando no lo reemplaza). Mica verifica el sitio, llms.txt, sitemap.xml y robots.txt sin 404.

## Versión nueva (cambios complejos o rediseños)

1. Con autorización: `npm run geo:zip` (usar `--dry-run` primero si hay dudas).
2. Lucas pasa el zip a Mica; el zip no pisa `tickets.json` ni imágenes. Confirmar que el `tickets.json` de producción coincide con el del proyecto.
3. Después: `npm run geo:verificar` y Rich Results Test.

La primera publicación GEO es una versión nueva (zip) prevista para el miércoles 25-11-2026 desde `feat-GEO`, como excepción al flujo de ramas.

## Límites conocidos

- Los links de compra no se verifican automáticamente.
- `geo:validar` y `geo:verificar` son estructurales: no reemplazan al Rich Results Test.
- El repo no se actualiza solo con lo publicado (paso manual a decisión de Lucas).
- Los comandos funcionan por ahora solo en la Mac de Lucas.
