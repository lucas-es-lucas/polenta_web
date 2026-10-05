
setTimeout(function () {
     var headID = document.getElementsByTagName("head")[0];
     var newScript = document.createElement('script');
     newScript.type = 'text/javascript';
     // newScript.src = 'http://www.somedomain.com/somescript.js';
     newScript.src = "https://optin.myperfit.com/res/js/fiestapolenta/uTNllBzR.js"
     headID.appendChild(newScript);
}, 15000); // 15 segundos de delay para mostrar el popup

(() => {
     const loader = document.getElementById("initial-loader");
     const loaderLogo = document.getElementById("initial-loader-logo");
     const backgroundVideo = document.getElementById("hero_bgs");
     const ticketsVideo = document.getElementById("tickets_bgs");
     const skipLoader = document.documentElement.classList.contains("skip-loader");

     if (!loader || !loaderLogo || !backgroundVideo) return;

     const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
     let activeHeroViewportVariant;
     let activeTicketsViewportVariant;
     let resourceVersion = 0;
     let siteRevealed = false;
     const loaderStartedAt = performance.now();
     const MINIMUM_LOADER_DURATION = 2000;

     const waitForImage = (image) => new Promise((resolve) => {
          if (image.complete) {
               resolve();
               return;
          }

          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
     });

     const setVideoSource = (video, sources, shouldLoop) => {
         const canPlayWebm = video.canPlayType("video/webm") !== "";
          const source = canPlayWebm || !sources.mp4 ? sources.webm : sources.mp4;

         video.loop = shouldLoop;

          if (video.dataset.activeSource === source) return Promise.resolve();

          video.dataset.activeSource = source;

          return new Promise((resolve) => {
               const finish = () => resolve();

               video.addEventListener("loadeddata", finish, { once: true });
               video.addEventListener("error", finish, { once: true });
               video.src = source;
               video.load();
          });
     };

     const getHeroViewportVariant = () => {
          const isLandscape = window.matchMedia("(orientation: landscape)").matches;

          if (window.innerWidth < 768) {
               return isLandscape ? "mobileLandscape" : "mobilePortrait";
          }

          if (window.innerWidth < 1200) {
               return isLandscape ? "tabletLandscape" : "mobilePortrait";
          }

          return "desktop";
     };

     const getTicketsViewportVariant = () => {
          if (window.innerWidth < 768) return "mobile";
          if (window.innerWidth < 1200) return "tablet";
          return "desktop";
     };

     const heroSources = {
          mobilePortrait: {
               webm: backgroundVideo.dataset.mobilePortraitWebm,
               mp4: backgroundVideo.dataset.mobilePortraitMp4,
          },
          mobileLandscape: {
               webm: backgroundVideo.dataset.mobileLandscapeWebm,
               mp4: backgroundVideo.dataset.mobileLandscapeMp4,
          },
          tabletLandscape: {
               webm: backgroundVideo.dataset.tabletLandscapeWebm,
               mp4: backgroundVideo.dataset.tabletLandscapeMp4,
          },
          desktop: {
               webm: backgroundVideo.dataset.desktopWebm,
               mp4: backgroundVideo.dataset.desktopMp4,
          },
     };

     const ticketsSources = {
          mobile: {
               webm: "/imgs/video/bg-tickets-320-vertical.webm",
               mp4: "/imgs/video/bg-tickets-320-vertical.mp4",
          },
          tablet: {
               webm: "/imgs/video/bg-tickets-768.webm",
               mp4: "/imgs/video/bg-tickets-768.mp4",
          },
          desktop: {
               webm: ticketsVideo?.dataset.webm,
               mp4: ticketsVideo?.dataset.mp4,
          },
     };

     const configureHeroMedia = () => {
          const viewportVariant = getHeroViewportVariant();
          activeHeroViewportVariant = viewportVariant;

          return [
               setVideoSource(backgroundVideo, heroSources[viewportVariant], !reduceMotion),
          ];
     };

     const configureTicketsMedia = () => {
          if (!ticketsVideo) return Promise.resolve();

          const viewportVariant = getTicketsViewportVariant();
          activeTicketsViewportVariant = viewportVariant;

          return setVideoSource(ticketsVideo, ticketsSources[viewportVariant], true)
               .then(() => ticketsVideo.play().catch(() => {}));
     };

     const startHeroAnimations = () => {
          backgroundVideo.play().catch(() => {});
     };

     const revealSite = () => {
          if (siteRevealed) return;

          siteRevealed = true;
          document.body.classList.remove("is-loading");
          document.body.classList.add("loader-ready");

          if (skipLoader) {
               startHeroAnimations();
               loader.remove();
               return;
          }

          loader.classList.add("initial-loader--leaving");

          if (reduceMotion) {
               startHeroAnimations();
               loader.remove();
               return;
          }

          loader.addEventListener("transitionend", (event) => {
               if (event.propertyName !== "opacity") return;
               startHeroAnimations();
               loader.remove();
          }, { once: true });
     };

     const loadCriticalResources = () => {
          const currentVersion = ++resourceVersion;
          const criticalResources = [
               waitForImage(loaderLogo),
               ...configureHeroMedia(),
          ];

          Promise.all(criticalResources).then(() => {
               const remainingDuration = Math.max(
                    0,
                    MINIMUM_LOADER_DURATION - (performance.now() - loaderStartedAt),
               );

               window.setTimeout(() => {
                    if (currentVersion === resourceVersion) revealSite();
               }, remainingDuration);
          });
     };

     window.addEventListener("resize", () => {
          const heroViewportVariant = getHeroViewportVariant();
          const ticketsViewportVariant = getTicketsViewportVariant();

          if (ticketsViewportVariant !== activeTicketsViewportVariant) {
               configureTicketsMedia();
          }

          if (heroViewportVariant === activeHeroViewportVariant) return;

          if (siteRevealed) {
               Promise.all(configureHeroMedia()).then(startHeroAnimations);
               return;
          }

          loadCriticalResources();
     });

     configureTicketsMedia();
     if (skipLoader) {
          Promise.all(configureHeroMedia()).then(revealSite);
     } else {
          loadCriticalResources();
     }
})();

// console.log('pirulo');
// setTimeout(executeMainFunction, 5000);

// document.addEventListener("DOMContentLoaded", function () {
//      const goButton = document.querySelector(".go-to-tickets");

//      // Detectamos si estamos en index.html
//      const isIndex = window.location.pathname.endsWith("index.html") || window.location.pathname === "/";

//      if (isIndex) {
//           const heroSection = document.querySelector(".hero");

//           if (heroSection) {
//                // Solo en index.html aplicamos IntersectionObserver
//                const observer = new IntersectionObserver(
//                     (entries) => {
//                          entries.forEach(entry => {
//                               if (entry.isIntersecting) {
//                                    goButton.classList.remove("show");
//                               } else {
//                                    goButton.classList.add("show");
//                               }
//                          });
//                     },
//                     { root: null, threshold: 0 }
//                );

//                observer.observe(heroSection);
//           }
//      } else {
//           // Otras páginas: el botón puede mostrarse por defecto o seguir oculto
//           goButton.classList.add("show");
//      }
// });

document.addEventListener("DOMContentLoaded", function () {
     const ticketsSection = document.getElementById("tickets");
     const nosotrosSection = document.getElementById("nosotros");
     const nosotrosContainer = nosotrosSection?.closest(".nosotros__container");

     if (ticketsSection && nosotrosContainer) {
          nosotrosContainer.after(ticketsSection);
     }

     const initialHash = window.location.hash;
     const shouldCorrectInitialHashNavigation = ["#hero", "#tickets"].includes(initialHash);
     const initialHashTarget = shouldCorrectInitialHashNavigation
          ? document.querySelector(initialHash)
          : null;

     if (initialHashTarget) {
          let initialHashNavigationPending = true;
          let initialHashNavigationFrame;

          const correctInitialHashNavigation = () => {
               if (!initialHashNavigationPending) return;

               window.cancelAnimationFrame(initialHashNavigationFrame);
               initialHashNavigationFrame = window.requestAnimationFrame(() => {
                    initialHashTarget.scrollIntoView({ block: "start", behavior: "auto" });
               });
          };

          const initialHashNavigationObserver = new ResizeObserver(
               correctInitialHashNavigation,
          );
          initialHashNavigationObserver.observe(nosotrosContainer);
          correctInitialHashNavigation();

          window.setTimeout(() => {
               initialHashNavigationPending = false;
               initialHashNavigationObserver.disconnect();
          }, 5000);
     }

     const goButton = document.querySelector(".go-to-tickets");
     if (!goButton || !ticketsSection) return;

     const mobileQuery = window.matchMedia("(max-width: 767px)");
     let visibilityFrame;

     const updateTicketsCtaVisibility = () => {
          window.cancelAnimationFrame(visibilityFrame);
          visibilityFrame = window.requestAnimationFrame(() => {
               const ticketsHavePassed = ticketsSection.getBoundingClientRect().bottom <= 0;
               goButton.classList.toggle("show", mobileQuery.matches || ticketsHavePassed);
          });
     };

     window.addEventListener("scroll", updateTicketsCtaVisibility, { passive: true });
     window.addEventListener("resize", updateTicketsCtaVisibility);
     mobileQuery.addEventListener("change", updateTicketsCtaVisibility);
     new ResizeObserver(updateTicketsCtaVisibility).observe(ticketsSection);
     updateTicketsCtaVisibility();
});

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
