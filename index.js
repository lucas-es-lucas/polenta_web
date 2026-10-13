
setTimeout(function () {
     var headID = document.getElementsByTagName("head")[0];
     var newScript = document.createElement('script');
     newScript.type = 'text/javascript';
     // newScript.src = 'http://www.somedomain.com/somescript.js';
     newScript.src = "https://optin.myperfit.com/res/js/fiestapolenta/uTNllBzR.js"
     headID.appendChild(newScript);
}, 15000); // 15 segundos de delay para mostrar el popup

document.addEventListener("DOMContentLoaded", () => {
     const block = document.querySelector("#hero-tickets");
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
