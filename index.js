/*
 * Loader inicial y recursos críticos de Hero.
 *
 * Tickets no participa de este flujo: tickets.js sigue cargando y renderizando
 * de forma independiente para no retrasar la primera vista.
 */
(() => {
     const MINIMUM_LOADER_DURATION = 3000;
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

     let activeBackgroundVariant = "";

     const setBackgroundSources = () => {
          const variant = getBackgroundVariant();

          if (variant.name === activeBackgroundVariant) return;

          activeBackgroundVariant = variant.name;
          backgroundVideo.replaceChildren();

          [
               { src: variant.webm, type: "video/webm" },
               { src: variant.mp4, type: "video/mp4" },
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
          heroAnimations.forEach((video) => {
               /*
                * Reduced motion conserva una reproducción completa, pero evita
                * reinicios automáticos al terminar.
                */
               video.loop = !reducedMotion.matches;
               video.currentTime = 0;

               video.play().catch(() => {
                    /*
                    * Si autoplay no está disponible, el poster conserva una
                    * representación visual estática de la animación.
                    */
               });
          });
     };

     const updateHeroMotionPreference = () => {
          heroAnimations.forEach((video) => {
               video.loop = !reducedMotion.matches;
          });
     };

     setBackgroundSources();

     /*
      * La variante de fondo cambia sólo si el viewport cruza un breakpoint
      * o cambia de orientación. No se recarga si sigue siendo la misma.
      */
     let resizeFrame;

     window.addEventListener(
          "resize",
          () => {
               window.cancelAnimationFrame(resizeFrame);

               resizeFrame = window.requestAnimationFrame(setBackgroundSources);
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
      * CTA desktop: aparece únicamente al salir Hero + Tickets completo.
      */
     if (!cta) return;

     let ctaObserver;

     const syncCta = () => {
          ctaObserver?.disconnect();

          if (!desktop.matches) {
               cta.classList.add("show");
               return;
          }

          cta.classList.remove("show");

          ctaObserver = new IntersectionObserver(([entry]) => {
               cta.classList.toggle("show", !entry.isIntersecting);
          });

          ctaObserver.observe(block);
     };

     desktop.addEventListener("change", syncCta);
     syncCta();
});

// document.addEventListener("DOMContentLoaded", () => {
//      const block = document.querySelector("#hero-tickets");
//      const cta = document.querySelector(".go-to-tickets");
//      const desktop = window.matchMedia("(min-width: 1200px)");

//      if (!cta || !block) return;

//      let ctaObserver;

//      const syncCta = () => {
//           ctaObserver?.disconnect();

//           if (!desktop.matches) {
//                cta.classList.add("show");
//                return;
//           }

//           cta.classList.remove("show");

//           ctaObserver = new IntersectionObserver(([entry]) => {
//                cta.classList.toggle("show", !entry.isIntersecting);
//           });

//           ctaObserver.observe(block);
//      };

//      desktop.addEventListener("change", syncCta);
//      syncCta();
// });

document.addEventListener("DOMContentLoaded", function () {
     const contactoLink = document.querySelector('a[href="#contacto"]');
     const contactoTarget = document.getElementById("contacto");
     const puestasSlider = document.querySelector(".puestas__slider");

     if (!contactoLink || !contactoTarget || !puestasSlider) return;

     let contactNavigationPending = false;
     let contactNavigationTimeout;

     const correctContactNavigation = () => {
          if (!contactNavigationPending || window.location.hash !== "#contacto") return;

          contactoTarget.scrollIntoView({
               block: "start",
               behavior: "instant",
          });
     };

     const beginContactNavigationCorrection = () => {
          contactNavigationPending = true;

          window.clearTimeout(contactNavigationTimeout);
          contactNavigationTimeout = window.setTimeout(() => {
               contactNavigationPending = false;
          }, 5000);

          requestAnimationFrame(() => {
               requestAnimationFrame(correctContactNavigation);
          });
     };

     contactoLink.addEventListener("click", beginContactNavigationCorrection);

     window.addEventListener("hashchange", () => {
          if (window.location.hash === "#contacto") {
               beginContactNavigationCorrection();
          }
     });

     const puestasResizeObserver = new ResizeObserver(() => {
          requestAnimationFrame(correctContactNavigation);
     });

     puestasResizeObserver.observe(puestasSlider);
});

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
