/*
 * Loader inicial y recursos críticos de Hero.
 *
 * Tickets no participa de este flujo: tickets.js sigue cargando y renderizando
 * de forma independiente para no retrasar la primera vista.
 */
(() => {
     const MINIMUM_LOADER_DURATION = 2000;
     const MAXIMUM_CRITICAL_WAIT = 12000;

     const root = document.documentElement;
     const loader = document.querySelector("#initial-loader");
     const backgroundVideo = document.querySelector("#hero_bgs");
     const heroAnimations = Array.from(
          document.querySelectorAll(
               ".animations__asterisk, .animations__logo",
          ),
     );
     const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
     );

     if (!backgroundVideo) return;

     /*
      * Sólo se inserta en el DOM la variante necesaria para el viewport actual.
      * Así el navegador no descarga los videos de breakpoints inactivos.
      */
     const getBackgroundVariant = () => {
          const isMobile = window.matchMedia("(max-width: 575px)").matches;
          const isPortrait = window.matchMedia("(orientation: portrait)").matches;
          const isTablet = window.matchMedia("(max-width: 1199px)").matches;

          if (isMobile && isPortrait) {
               return {
                    name: "mobile-vertical",
                    webm: backgroundVideo.dataset.mobileVerticalWebm,
                    mp4: backgroundVideo.dataset.mobileVerticalMp4,
               };
          }

          if (isTablet) {
               return {
                    name: "tablet",
                    webm: backgroundVideo.dataset.tabletWebm,
                    mp4: backgroundVideo.dataset.tabletMp4,
               };
          }

          return {
               name: "desktop",
               webm: backgroundVideo.dataset.desktopWebm,
               mp4: backgroundVideo.dataset.desktopMp4,
          };
     };

     const isMobilePortrait = () =>
          window.matchMedia("(max-width: 575px)").matches &&
          window.matchMedia("(orientation: portrait)").matches;

     const getHeroAnimationVariant = (video) => {
          const useMobileVariant = isMobilePortrait();

          return {
               name: useMobileVariant ? "mobile-portrait" : "default",
               mov: useMobileVariant
                    ? video.dataset.mobilePortraitMov
                    : video.dataset.defaultMov,
               webm: useMobileVariant
                    ? video.dataset.mobilePortraitWebm
                    : video.dataset.defaultWebm,
          };
     };

     let heroAnimationsStarted = false;

     const playHeroAnimation = (video) => {
          const start = () => {
               video.loop = !reducedMotion.matches;
               video.currentTime = 0;

               video.play().catch(() => {
                    /*
                     * Si autoplay no está disponible, el poster conserva una
                     * representación visual estática de la animación.
                     */
               });
          };

          if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
               start();
               return;
          }

          video.addEventListener("loadeddata", start, { once: true });
     };

     const setHeroAnimationSources = () => {
          heroAnimations.forEach((video) => {
               const variant = getHeroAnimationVariant(video);

               if (video.dataset.activeVariant === variant.name) return;

               video.dataset.activeVariant = variant.name;
               video.replaceChildren();

               [
                    {
                         src: variant.mov,
                         type: "video/quicktime; codecs=hvc1",
                    },
                    {
                         src: variant.webm,
                         type: "video/webm",
                    },
               ].forEach(({ src, type }) => {
                    const source = document.createElement("source");

                    source.src = src;
                    source.type = type;

                    video.appendChild(source);
               });

               video.preload = "auto";
               video.load();

               if (heroAnimationsStarted) {
                    playHeroAnimation(video);
               }
          });
     };

     let activeBackgroundVariant = "";

     const setBackgroundSources = () => {
          const variant = getBackgroundVariant();

          if (variant.name === activeBackgroundVariant) return;

          activeBackgroundVariant = variant.name;
          backgroundVideo.replaceChildren();

          /*
           * MP4/H.264 se prioriza para que WebKit en iPhone use su ruta de
           * decodificación más compatible. WebM permanece como alternativa.
           * El navegador selecciona una sola fuente, no descarga ambas.
           */
          [
               { src: variant.mp4, type: "video/mp4" },
               { src: variant.webm, type: "video/webm" },
          ].forEach(({ src, type }) => {
               const source = document.createElement("source");

               source.src = src;
               source.type = type;

               backgroundVideo.appendChild(source);
          });

          backgroundVideo.preload = "auto";
          backgroundVideo.load();

          /*
          * Al insertar sources dinámicamente, autoplay por sí solo no siempre
          * reinicia la reproducción. Esta llamada cubre ese caso.
          */
          backgroundVideo.muted = true;
          backgroundVideo.defaultMuted = true;

          backgroundVideo.play().catch(() => {
               /*
                * El video permanece con su poster/frame disponible si el navegador
                * impide la reproducción automática.
                */
          });
     };

     /*
      * Se considera listo cuando el primer frame puede mostrarse.
      * No se espera la descarga completa del archivo.
      *
      * Si un recurso falla, el loader continúa: nunca debe dejar el sitio
      * bloqueado por un error de red o compatibilidad.
      */
     const waitForVideoFrame = (video) =>
          new Promise((resolve) => {
               const finish = () => {
                    video.removeEventListener("loadeddata", finish);
                    video.removeEventListener("error", finish);
                    resolve();
               };

               if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
                    finish();
                    return;
               }

               video.addEventListener("loadeddata", finish, { once: true });
               video.addEventListener("error", finish, { once: true });
          });

     const waitForImage = (image) =>
          new Promise((resolve) => {
               if (image.complete) {
                    resolve();
                    return;
               }

               image.addEventListener("load", resolve, { once: true });
               image.addEventListener("error", resolve, { once: true });
          });

     const wait = (duration) =>
          new Promise((resolve) => {
               window.setTimeout(resolve, duration);
          });

     const startHeroAnimations = () => {
          heroAnimationsStarted = true;
          heroAnimations.forEach(playHeroAnimation);
     };

     const updateHeroMotionPreference = () => {
          heroAnimations.forEach((video) => {
               video.loop = !reducedMotion.matches;
          });
     };

     const syncHeroMedia = () => {
          setBackgroundSources();
          setHeroAnimationSources();
     };

     syncHeroMedia();

     /*
      * La variante de fondo cambia sólo si el viewport cruza un breakpoint
      * o cambia de orientación. No se recarga si sigue siendo la misma.
      */
     let resizeFrame;

     window.addEventListener(
          "resize",
          () => {
               window.cancelAnimationFrame(resizeFrame);

               resizeFrame = window.requestAnimationFrame(syncHeroMedia);
          },
          { passive: true },
     );

     reducedMotion.addEventListener("change", updateHeroMotionPreference);

     /*
      * Las entradas con hash son navegación intencional hacia Hero o Tickets.
      * Allí se omite el loader, pero se prepara la misma variante de fondo.
      */
     if (!root.classList.contains("is-loading") || !loader) {
          backgroundVideo.play().catch(() => { });
          startHeroAnimations();
          return;
     }

     const loaderLogo = loader.querySelector(".initial-loader__logo");
     const startedAt = performance.now();

     const criticalResources = Promise.all([
          waitForImage(loaderLogo),
          waitForVideoFrame(backgroundVideo),
          ...heroAnimations.map(waitForVideoFrame),
     ]);

     const minimumDuration = wait(
          Math.max(0, MINIMUM_LOADER_DURATION - (performance.now() - startedAt)),
     );

     /*
      * La salvaguarda evita una pantalla bloqueada ante una solicitud que queda
      * pendiente sin disparar un evento de error.
      */
     Promise.race([
          Promise.all([criticalResources, minimumDuration]),
          wait(MAXIMUM_CRITICAL_WAIT),
     ]).then(() => {
          loader.classList.add("is-leaving");
          root.classList.remove("is-loading");

          let completed = false;

          const finishLoader = () => {
               if (completed) return;

               completed = true;
               loader.remove();
               startHeroAnimations();
          };

          loader.addEventListener(
               "transitionend",
               (event) => {
                    if (event.target === loader) {
                         finishLoader();
                    }
               },
               { once: true },
          );

          /*
           * Fallback si transitionend no llega a dispararse.
           */
          window.setTimeout(finishLoader, 600);
     });
})();

setTimeout(function () {
     var headID = document.getElementsByTagName("head")[0];
     var newScript = document.createElement('script');
     newScript.type = 'text/javascript';
     // newScript.src = 'http://www.somedomain.com/somescript.js';
     newScript.src = "https://optin.myperfit.com/res/js/fiestapolenta/uTNllBzR.js"
     headID.appendChild(newScript);
}, 15000); // 15 segundos de delay para mostrar el popup

document.addEventListener("DOMContentLoaded", () => {
     const block = document.querySelector(".hero-tickets");
     const stage = document.querySelector(".hero-tickets__stage");
     const cta = document.querySelector(".go-to-tickets");
     const desktop = window.matchMedia("(min-width: 1200px)");

     if (!block) return;

     /*
      * Muestra el video solo detrás de la porción actualmente visible
      * del bloque Hero + Tickets.
      */
     if (stage) {
          let framePending = false;

          const syncStageClip = () => {
               framePending = false;

               const rect = block.getBoundingClientRect();
               const viewportHeight = window.innerHeight;

               const blockIsVisible =
                    rect.bottom > 0 &&
                    rect.top < viewportHeight;

               if (!blockIsVisible) {
                    stage.style.clipPath = "inset(100% 0 0 0)";
                    return;
               }

               const topInset = Math.max(
                    0,
                    Math.min(viewportHeight, rect.top)
               );

               const bottomInset = Math.max(
                    0,
                    Math.min(viewportHeight, viewportHeight - rect.bottom)
               );

               stage.style.clipPath =
                    `inset(${topInset}px 0 ${bottomInset}px 0)`;
          };

          const requestStageSync = () => {
               if (framePending) return;

               framePending = true;
               requestAnimationFrame(syncStageClip);
          };

          window.addEventListener("scroll", requestStageSync, {
               passive: true,
          });

          window.addEventListener("resize", requestStageSync);

          const stageResizeObserver = new ResizeObserver(requestStageSync);
          stageResizeObserver.observe(block);

          syncStageClip();
     }

     /*
      * Mobile: el CTA permanece visible salvo mientras Tickets esté en pantalla.
      * Desktop: aparece únicamente después de salir del bloque Hero + Tickets.
      * Se reutiliza una sola instancia de IntersectionObserver al cambiar
      * de breakpoint.
      */
     if (!cta) return;

     const ticketsSection = document.querySelector(".tickets__section");
     /*
     * IntersectionObserver considera todo el viewport, incluso la parte
     * cubierta visualmente por la cabecera fixed.
     *
     * Se utiliza su altura real para excluir esa zona del área observable.
     */
     const fixedHeader = document.querySelector(".header__fixed");
     let ctaObserver;

     const syncCta = () => {
          ctaObserver?.disconnect();

          const target = desktop.matches ? block : ticketsSection;

          if (!target) {
               cta.classList.remove("show");
               return;
          }

          /*
           * En mobile se muestra inmediatamente. El observer la oculta cuando
           * llega el título de Tickets: tickets__section tiene 3rem (48px) de
           * padding superior antes de ese contenido visible.
           *
           * En desktop se conserva la observación del bloque Hero + Tickets.
           */
          if (desktop.matches) {
               cta.classList.remove("show");
          } else {
               cta.classList.add("show");
          }

          /*
           * La cabecera fixed no ocupa espacio dentro del layout y el observer no
           * la descuenta automáticamente. Por eso una pequeña franja del bloque
           * anterior puede seguir considerándose visible aunque esté escondida
           * detrás de announcement bar + navbar.
           */
          const headerHeight = fixedHeader
               ? Math.ceil(fixedHeader.getBoundingClientRect().height)
               : 0;

          /*
           * En ambos modos se excluye la zona superior cubierta por la cabecera.
           *
           * Mobile conserva además sus 48px inferiores actuales: corresponden al
           * padding previo al contenido visible de Tickets y evitan ocultar el CTA
           * antes de que esa section empiece realmente a aparecer.
           *
           * Desktop continúa observando el bloque completo Hero + Tickets, pero deja
           * de considerarlo visible cuando su parte restante queda detrás del header.
           */
          const observerOptions = desktop.matches
               ? {
                    rootMargin: `-${headerHeight}px 0px 0px 0px`,
                    threshold: 0,
               }
               : {
                    rootMargin: `-${headerHeight}px 0px -48px 0px`,
                    threshold: 0,
               };

          ctaObserver = new IntersectionObserver(([entry]) => {
               cta.classList.toggle("show", !entry.isIntersecting);
          }, observerOptions);

          ctaObserver.observe(target);
     };

     desktop.addEventListener("change", syncCta);
     syncCta();
});

// document.addEventListener("DOMContentLoaded", () => {
//      const contactoLinks = document.querySelectorAll('a[href="#contacto"]');
//      const contactoTarget = document.getElementById("contacto");
//      const puestasSlider = document.querySelector(".puestas__slider");
//      const root = document.documentElement;

//      if (!contactoLinks.length || !contactoTarget || !puestasSlider) return;

//      let contactNavigationPending = false;
//      let contactNavigationTimeout;

//      const correctContactNavigation = () => {
//           if (!contactNavigationPending || window.location.hash !== "#contacto") {
//                return;
//           }

//           /*
//            * Evita que html { scroll-behavior: smooth } deje una animación
//            * nativa compitiendo con esta corrección de posición.
//            */
//           const previousScrollBehavior = root.style.scrollBehavior;

//           root.style.scrollBehavior = "auto";
//           contactoTarget.scrollIntoView({ block: "start" });
//           root.style.scrollBehavior = previousScrollBehavior;
//      };

//      const beginContactNavigationCorrection = () => {
//           contactNavigationPending = true;

//           window.clearTimeout(contactNavigationTimeout);
//           contactNavigationTimeout = window.setTimeout(() => {
//                contactNavigationPending = false;
//           }, 5000);

//           requestAnimationFrame(() => {
//                requestAnimationFrame(correctContactNavigation);
//           });
//      };

//      const requestContactNavigationCorrection = () => {
//           if (window.location.hash !== "#contacto" || root.classList.contains("is-loading")) {
//                return;
//           }

//           beginContactNavigationCorrection();
//      };

//      contactoLinks.forEach((contactoLink) => {
//           contactoLink.addEventListener("click", (event) => {
//                /*
//                 * Se evita el scroll nativo suave. pushState conserva la URL
//                 * con #contacto sin disparar otra navegación paralela.
//                 */
//                event.preventDefault();

//                if (window.location.hash !== "#contacto") {
//                     window.history.pushState(null, "", "#contacto");
//                }

//                beginContactNavigationCorrection();
//           });
//      });

//      window.addEventListener("hashchange", requestContactNavigationCorrection);

//      /*
//       * #contacto no omite el loader. Al liberarse el scroll, se aplica por
//       * primera vez la posición correcta para una entrada directa con hash.
//       */
//      const loaderStateObserver = new MutationObserver(
//           requestContactNavigationCorrection,
//      );

//      loaderStateObserver.observe(root, {
//           attributes: true,
//           attributeFilter: ["class"],
//      });

//      /*
//       * Cubre la carga inicial directa una vez que DOMContentLoaded termina.
//       */
//      requestContactNavigationCorrection();

//      const puestasResizeObserver = new ResizeObserver(() => {
//           requestAnimationFrame(correctContactNavigation);
//      });

//      puestasResizeObserver.observe(puestasSlider);
// });

document.addEventListener("DOMContentLoaded", () => {
     const contactoTarget = document.getElementById("contacto");
     const puestasSlider = document.querySelector(".puestas__slider");

     if (!contactoTarget || !puestasSlider) return;

     let contactNavigationPending = false;
     let contactNavigationTimeout;

     const correctContactNavigation = () => {
          if (!contactNavigationPending || window.location.hash !== "#contacto") {
               return;
          }

          /*
           * behavior: "auto" respeta html { scroll-behavior: smooth }.
           * Así Contacto conserva el mismo desplazamiento nativo suave que
           * Tickets, Nosotros y Puestas.
           */
          contactoTarget.scrollIntoView({
               block: "start",
               behavior: "auto",
          });
     };

     const beginContactNavigationCorrection = () => {
          contactNavigationPending = true;

          window.clearTimeout(contactNavigationTimeout);
          contactNavigationTimeout = window.setTimeout(() => {
               contactNavigationPending = false;
          }, 5000);

          /*
           * Deja que el navegador inicie su navegación nativa por hash y
           * luego corrige la posición si Puestas termina de ajustar su layout.
           */
          requestAnimationFrame(() => {
               requestAnimationFrame(correctContactNavigation);
          });
     };

     window.addEventListener("hashchange", () => {
          if (window.location.hash === "#contacto") {
               beginContactNavigationCorrection();
          }
     });

     /*
      * Cubre una entrada directa a /index.html#contacto. Esta ruta ahora
      * omite el loader, igual que las demás navigaciones a sections.
      */
     if (window.location.hash === "#contacto") {
          beginContactNavigationCorrection();
     }

     const puestasResizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(correctContactNavigation);
     });

     puestasResizeObserver.observe(puestasSlider);
});

document.addEventListener("DOMContentLoaded", () => {
     /*
      * Si Tickets todavía no se renderizó, la navegación nativa a una section
      * posterior calcula el hash con una altura incompleta. Al terminar de
      * insertar los tickets, se repite una única vez el desplazamiento.
      */
     const ticketSlider = document.getElementById("ticketsSlider");
     const delayedTargets = new Set([
          "#nosotros",
          "#puestas",
          "#contacto",
     ]);

     if (!ticketSlider) return;

     let ticketsRendered = ticketSlider.children.length > 0;
     let pendingHash = "";

     const correctPendingNavigation = () => {
          if (!pendingHash || window.location.hash !== pendingHash) {
               pendingHash = "";
               return;
          }

          const target = document.querySelector(pendingHash);

          if (!target) {
               pendingHash = "";
               return;
          }

          /*
           * "auto" respeta html { scroll-behavior: smooth }, igual que las
           * demás navigaciones nativas por hash.
           */
          target.scrollIntoView({
               block: "start",
               behavior: "auto",
          });

          pendingHash = "";
     };

     const queueInitialHashCorrection = () => {
          const { hash } = window.location;

          if (!delayedTargets.has(hash)) return;

          /*
           * En una entrada externa con hash, corregir aun si la respuesta de
           * Tickets llegó excepcionalmente antes de DOMContentLoaded.
           */
          pendingHash = hash;

          if (ticketsRendered) {
               requestAnimationFrame(correctPendingNavigation);
          }
     };

     const ticketsObserver = new MutationObserver(() => {
          if (ticketsRendered) return;

          ticketsRendered = ticketSlider.children.length > 0;

          if (ticketsRendered && pendingHash) {
               requestAnimationFrame(correctPendingNavigation);
          }
     });

     ticketsObserver.observe(ticketSlider, {
          childList: true,
     });

     /*
      * Cubre /index.html#nosotros, #puestas y #contacto provenientes de
      * Términos y Privacidad.
      */
     queueInitialHashCorrection();

     /*
      * Cubre un clic muy temprano desde la navbar de index.html, antes de que
      * tickets.js haya terminado de poblar la grilla.
      */
     window.addEventListener("hashchange", () => {
          if (!ticketsRendered) {
               queueInitialHashCorrection();
          }
     });
});

/*
 * Nosotros: mide la introducción para que CSS pueda asignar
 * el alto restante a cada fila de cards.
 *
 * No modifica el scroll ni interviene en la visibilidad del CTA.
 */
(() => {
     const initNosotrosViewport = () => {
          const container = document.querySelector(".nosotros__container");
          const intro = container?.querySelector(".nosotros__queeslapolenta");

          if (
               !container ||
               !intro ||
               !("ResizeObserver" in window) ||
               !CSS.supports("height", "100svh")
          ) {
               return;
          }

          const compactViewport = window.matchMedia(
               "(min-width: 768px) and (max-width: 1199px) and (max-height: 900px)",
          );

          let frame = 0;

          const measure = () => {
               frame = 0;

               if (!compactViewport.matches) {
                    container.classList.remove("nosotros--viewport-ready");
                    container.style.removeProperty("--nosotros-intro-height");
                    container.style.removeProperty("--nosotros-scroll-offset");
                    return;
               }

               /*
                * Incluye título, párrafos y gaps internos.
                * Redondear hacia arriba evita sobreestimar el espacio libre.
                */
               const introHeight = Math.ceil(
                    intro.getBoundingClientRect().height,
               );

               /*
                * Lee el desplazamiento usado por la navegación nativa.
                * Se mide scroll-padding-top porque ésa es la referencia
                * actual del ancla, independientemente del observer del CTA.
                */
               const rootStyles = getComputedStyle(
                    document.documentElement,
               );

               const scrollOffset =
                    parseFloat(rootStyles.scrollPaddingTop) || 0;

               container.style.setProperty(
                    "--nosotros-intro-height",
                    `${introHeight}px`,
               );

               container.style.setProperty(
                    "--nosotros-scroll-offset",
                    `${scrollOffset}px`,
               );

               container.classList.add("nosotros--viewport-ready");
          };

          const scheduleMeasure = () => {
               if (frame) return;

               frame = window.requestAnimationFrame(measure);
          };

          /*
           * Sólo observamos la introducción:
           * cambiar el alto de las cards no vuelve a disparar
           * la medición por un cambio de alto de toda la sección.
           */
          const introObserver = new ResizeObserver(scheduleMeasure);
          introObserver.observe(intro);

          window.addEventListener("resize", scheduleMeasure, {
               passive: true,
          });

          compactViewport.addEventListener("change", scheduleMeasure);

          // Revisa el layout después de resolver las fuentes iniciales.
          document.fonts?.ready.then(scheduleMeasure);

          measure();
     };

     if (document.readyState === "loading") {
          document.addEventListener(
               "DOMContentLoaded",
               initNosotrosViewport,
               { once: true },
          );
     } else {
          initNosotrosViewport();
     }
})();

// document.addEventListener("DOMContentLoaded", () => {
//      const tickets = document.querySelectorAll(".ticket");

//      // Fecha actual
//      const today = new Date();

//      // normalizar las fechas
//      today.setHours(0, 0, 0, 0);

//      tickets.forEach(ticket => {
//           const img = ticket.querySelector(".ticket__img");

//           if (!img) return;

//           // Obtiene el src
//           const src = img.getAttribute("src");

//           // Busca una fecha tipo 20260522
//           const match = src.match(/(\d{8})/);

//           if (!match) return;

//           const dateString = match[1];

//           // Separar año, mes y día
//           const year = parseInt(dateString.substring(0, 4));
//           const month = parseInt(dateString.substring(4, 6)) - 1;
//           const day = parseInt(dateString.substring(6, 8));

//           const ticketDate = new Date(year, month, day);

//           // normalizar las fechas
//           ticketDate.setHours(0, 0, 0, 0);

//           const diffTime = today - ticketDate;

//           // Convertir a días
//           const diffDays = diffTime / (1000 * 60 * 60 * 24);

//           // Ocultar si pasaron más de 1 día //2 días
//           if (diffDays > 1) {
//                // ticket.style.display = "none";
//                ticket.remove();
//           }
//      });
// });
