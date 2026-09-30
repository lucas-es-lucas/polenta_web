# Polenta Web --- Hero + Tickets

## 1. Propósito

Este documento describe la relación, el orden y los recursos de las sections
Hero y Tickets.

## 2. Sections independientes

Hero y Tickets no comparten contenedor ni video de fondo.

Hero utiliza el video compuesto definido en `03-section-hero.md`.

Tickets utiliza su propio video de fondo, seleccionado según el ancho del
viewport:

-   menos de `768px`: `bg-tickets-320-vertical`;
-   desde `768px` hasta `1199px`: `bg-tickets-768`;
-   desde `1200px`: `bg-tickets`.

Cada variante ofrece WebM y MP4 como alternativas de compatibilidad. La carga
del video de Tickets no forma parte de los recursos críticos del loader.

## 3. Comportamiento del scroll

Las sections siguen el scroll normal del documento. Al llegar a Tickets se
visualiza su video de fondo independiente.

## 4. Secuencia

El orden de visualización es:

1.  Hero.
2.  Nosotros.
3.  Tickets.
4.  Puestas.
5.  Contacto.
6.  Footer.

## 5. Relación con otros documentos

Las características exclusivas de cada section se documentan por separado:

-   `03-section-hero.md`
-   `04-section-tickets.md`

## 6. Información pendiente

La documentación disponible no especifica la implementación CSS exacta del
video de fondo de Tickets.
