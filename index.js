const LOADER_MINIMUM_DURATION = 2000;
const HOME_SECTION_HASHES = ["#hero", "#tickets", "#nosotros", "#puestas", "#contacto"];

window.setTimeout(() => {
     const perfitScript = document.createElement("script");
     perfitScript.type = "text/javascript";
     perfitScript.src = "https://optin.myperfit.com/res/js/fiestapolenta/uTNllBzR.js";
     document.head.appendChild(perfitScript);
}, 15000);

function getBackgroundVideoVariant() {
     const width = window.innerWidth;
     const isPortrait = window.matchMedia("(orientation: portrait)").matches;

     if (width < 768 || (width < 1200 && isPortrait)) {
          return {
               id: "vertical",
               webm: "/imgs/video/bg-tickets-320-vertical.webm",
               mp4: "/imgs/video/bg-tickets-320-vertical.mp4",
          };
     }

     if (width < 1200) {
          return {
               id: "tablet",
               webm: "/imgs/video/bg-tickets-768.webm",
               mp4: "/imgs/video/bg-tickets-768.mp4",
          };
     }

     return {
          id: "desktop",
          webm: "/imgs/video/bg-tickets.webm",
          mp4: "/imgs/video/bg-tickets.mp4",
     };
}

function setBackgroundVideo(video) {
     const variant = getBackgroundVideoVariant();

     if (video.dataset.variant === variant.id) return;

     video.dataset.variant = variant.id;
     video.innerHTML = `
          <source type="video/webm" src="${variant.webm}">
          <source type="video/mp4" src="${variant.mp4}">
     `;
     video.load();
}

function waitForImage(image) {
     if (image.complete) return Promise.resolve();

     return new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
     });
}

function waitForVideo(video) {
     if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          return Promise.resolve();
     }

     return new Promise((resolve) => {
          video.addEventListener("loadeddata", resolve, { once: true });
          video.addEventListener("error", resolve, { once: true });
     });
}

function wait(duration) {
     return new Promise((resolve) => window.setTimeout(resolve, duration));
}

function setHeaderHeight() {
     const header = document.querySelector(".header");
     if (!header) return;

     document.documentElement.style.setProperty(
          "--site-header-height",
          `${header.getBoundingClientRect().height}px`,
     );
}

function isAppleMobile() {
     return /iPad|iPhone|iPod/.test(navigator.userAgent) || (
          navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1
     );
}

function setupHeroAnimationSources() {
     const preferMov = isAppleMobile();

     document.querySelectorAll(".hero__animations video").forEach((video) => {
          const primary = preferMov
               ? { src: video.dataset.mov, type: "video/quicktime" }
               : { src: video.dataset.webm, type: "video/webm" };
          const fallback = preferMov
               ? { src: video.dataset.webm, type: "video/webm" }
               : { src: video.dataset.mov, type: "video/quicktime" };

          video.innerHTML = `
               <source src="${primary.src}" type="${primary.type}">
               <source src="${fallback.src}" type="${fallback.type}">
          `;
          video.load();
     });
}

function startHeroAnimations() {
     if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

     document.querySelectorAll(".hero__animations video").forEach((video) => {
          video.play().catch(() => {});
     });
}

function scrollToTickets(behavior = "smooth") {
     const heroTicketsBlock = document.getElementById("heroTickets");
     const ticketsSection = document.getElementById("tickets");

     if (!heroTicketsBlock || !ticketsSection) return;

     window.scrollTo({ top: 0, behavior });
     heroTicketsBlock.scrollTo({
          top: ticketsSection.offsetTop,
          behavior,
     });
}

function scrollToHero(behavior = "smooth") {
     const heroTicketsBlock = document.getElementById("heroTickets");
     if (!heroTicketsBlock) return;

     window.scrollTo({ top: 0, behavior });
     heroTicketsBlock.scrollTo({ top: 0, behavior });
}

function setupTicketsCta(goButton, heroTicketsBlock) {
     if (!goButton || !heroTicketsBlock) return;

     const mobileQuery = window.matchMedia("(max-width: 992px)");
     let isBlockVisible = true;
     const updateVisibility = ([entry]) => {
          isBlockVisible = entry.isIntersecting;
          goButton.classList.toggle(
               "show",
               !mobileQuery.matches && !isBlockVisible,
          );
     };

     const observer = new IntersectionObserver(updateVisibility, {
          root: null,
          threshold: 0,
     });

     observer.observe(heroTicketsBlock);
     mobileQuery.addEventListener("change", () => {
          goButton.classList.toggle("show", !mobileQuery.matches && !isBlockVisible);
     });
}

function setupScrollHandoff(heroTicketsBlock) {
     if (!heroTicketsBlock) return;

     heroTicketsBlock.addEventListener(
          "wheel",
          (event) => {
               if (event.ctrlKey || event.deltaY === 0) return;

               const maxScrollTop =
                    heroTicketsBlock.scrollHeight - heroTicketsBlock.clientHeight;
               const nextScrollTop = heroTicketsBlock.scrollTop + event.deltaY;

               if (event.deltaY > 0 && nextScrollTop > maxScrollTop) {
                    event.preventDefault();
                    heroTicketsBlock.scrollTop = maxScrollTop;
                    window.scrollBy({ top: nextScrollTop - maxScrollTop });
               }

               if (event.deltaY < 0 && nextScrollTop < 0) {
                    event.preventDefault();
                    heroTicketsBlock.scrollTop = 0;
                    window.scrollBy({ top: nextScrollTop });
               }
          },
          { passive: false },
     );
}

function setupInternalNavigation() {
     document
          .querySelectorAll('a[href="#hero"], a[href="#tickets"]')
          .forEach((link) => {
               link.addEventListener("click", (event) => {
                    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                    event.preventDefault();
                    const target = link.getAttribute("href");
                    window.history.replaceState(null, "", target);

                    if (target === "#tickets") {
                         scrollToTickets();
                    } else {
                         scrollToHero();
                    }
               });
          });
}

document.addEventListener("DOMContentLoaded", async () => {
     const loaderAsset = document.getElementById("loaderAsset");
     const backgroundVideo = document.getElementById("hero_bgs");
     const goButton = document.querySelector(".go-to-tickets");
     const heroTicketsBlock = document.getElementById("heroTickets");
     const skipLoader = HOME_SECTION_HASHES.includes(window.location.hash);

     setHeaderHeight();
     setupHeroAnimationSources();
     setBackgroundVideo(backgroundVideo);

     if (skipLoader) {
          document.body.classList.remove("is-loading");
          backgroundVideo.play().catch(() => {});
          startHeroAnimations();
          window.requestAnimationFrame(() => {
               if (window.location.hash === "#tickets") {
                    scrollToTickets("auto");
               } else if (window.location.hash === "#hero") {
                    scrollToHero("auto");
               }
          });
     } else {
          const loaderStartedAt = performance.now();
          await Promise.all([waitForImage(loaderAsset), waitForVideo(backgroundVideo)]);
          await wait(Math.max(0, LOADER_MINIMUM_DURATION - (performance.now() - loaderStartedAt)));

          document.body.classList.remove("is-loading");
          backgroundVideo.play().catch(() => {});
          window.setTimeout(startHeroAnimations, 350);
     }

     setupTicketsCta(goButton, heroTicketsBlock);
     setupScrollHandoff(heroTicketsBlock);
     setupInternalNavigation();
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

     if (window.location.hash === "#contacto") {
          beginContactNavigationCorrection();
     }
});

window.addEventListener("hashchange", () => {
     if (!HOME_SECTION_HASHES.includes(window.location.hash)) return;

     document.documentElement.classList.add("skip-loader");
     document.body.classList.remove("is-loading");
     if (window.location.hash === "#tickets") {
          scrollToTickets();
     } else if (window.location.hash === "#hero") {
          scrollToHero();
     }
});

window.addEventListener("resize", () => {
     setHeaderHeight();

     const backgroundVideo = document.getElementById("hero_bgs");
     if (!backgroundVideo) return;

     const currentTime = backgroundVideo.currentTime;
     setBackgroundVideo(backgroundVideo);
     if (backgroundVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          backgroundVideo.currentTime = currentTime;
          backgroundVideo.play().catch(() => {});
     }
});
