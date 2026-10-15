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

La navegación interna utiliza el scroll suave nativo y `scroll-padding-top:
6rem` para reservar el espacio de la cabecera fija.

## 4. CTA Comprar Tickets

El CTA fijo navega a `#tickets`. Su posición se adapta al viewport:

-   bajo `1200px`, se centra horizontalmente;
-   desde `1200px`, se alinea a la derecha;
-   en todos los breakpoints conserva una separación inferior equivalente a
    `max(1.25rem, env(safe-area-inset-bottom))`.

Su visibilidad se controla desde JavaScript con una única instancia de
`IntersectionObserver` por breakpoint:

-   bajo `1200px`, se muestra excepto mientras el título o la grilla de
    Tickets están visibles;
-   desde `1200px`, se oculta mientras Hero o Tickets están visibles y se
    muestra en Nosotros, Puestas, Contacto y las sections posteriores.

## 5. Navegación después de Tickets

Los tickets se insertan de forma asíncrona. Si se navega hacia una section
posterior antes de que termine esa inserción, el destino se corrige una única
vez para `#nosotros`, `#puestas` y `#contacto` después de que Tickets agrega
contenido.

La navegación a `#contacto` también se vuelve a alinear si el carrusel de
Puestas cambia de altura. Ambas correcciones respetan el scroll suave nativo.

## 6. Secuencia

El orden de visualización es:

1.  Hero.
2.  Nosotros.
3.  Tickets.
4.  Puestas.
5.  Contacto.
6.  Footer.

## 7. Relación con otros documentos

Las características exclusivas de cada section se documentan por separado:

-   `03-section-hero.md`
-   `04-section-tickets.md`

## 8. Información pendiente

La documentación disponible no especifica la implementación CSS exacta del
video de fondo de Tickets.
