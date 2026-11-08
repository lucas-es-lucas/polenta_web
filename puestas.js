(() => {
     const carousel = document.querySelector("[data-puestas-carousel]");
     const track = carousel?.querySelector("[data-puestas-carousel-track]");
     const previousButton = carousel?.querySelector(
          "[data-puestas-carousel-previous]",
     );
     const nextButton = carousel?.querySelector(
          "[data-puestas-carousel-next]",
     );
     const indicators = carousel?.querySelector(
          "[data-puestas-carousel-indicators]",
     );

     if (
          !carousel ||
          !track ||
          !previousButton ||
          !nextButton ||
          !indicators
     ) {
          return;
     }

     const slides = Array.from(
          track.querySelectorAll(".puestas-carousel__slide"),
     );
     const reducedMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
     );
     const AUTOPLAY_DELAY = 2500;
     const FADE_DURATION = 180;

     let targets = [];
     let autoplayTimer;
     let fadeTimer;
     let scrollFrame;
     let resizeFrame;
     let wheelTimer;
     let isVisible = false;
     let isPointerInside = false;
     let isFocused = false;

     const clearAutoplay = () => {
          window.clearTimeout(autoplayTimer);
     };

     const cancelFade = () => {
          window.clearTimeout(fadeTimer);
          carousel.classList.remove("is-fading");
     };

     const getActiveIndex = () => {
          if (!targets.length) return 0;

          return targets.reduce((closestIndex, target, index) => {
               const currentDistance = Math.abs(
                    track.scrollLeft - targets[closestIndex],
               );
               const nextDistance = Math.abs(track.scrollLeft - target);

               return nextDistance < currentDistance ? index : closestIndex;
          }, 0);
     };

     const updateActiveIndicator = () => {
          const activeIndex = getActiveIndex();

          indicators
               .querySelectorAll("[data-puestas-carousel-target]")
               .forEach((indicator, index) => {
                    if (index === activeIndex) {
                         indicator.setAttribute("aria-current", "true");
                    } else {
                         indicator.removeAttribute("aria-current");
                    }
               });
     };

     const buildTargets = () => {
          const maxScrollLeft = Math.max(
               0,
               track.scrollWidth - track.clientWidth,
          );

          targets = slides.reduce((positions, slide) => {
               const position = Math.min(
                    Math.round(slide.offsetLeft),
                    Math.round(maxScrollLeft),
               );

               if (positions[positions.length - 1] !== position) {
                    positions.push(position);
               }

               return positions;
          }, []);
     };

     const renderIndicators = () => {
          const activeIndex = getActiveIndex();
          const fragment = document.createDocumentFragment();

          targets.forEach((_, index) => {
               const indicator = document.createElement("button");

               indicator.type = "button";
               indicator.className = "puestas-carousel__indicator";
               indicator.dataset.puestasCarouselTarget = index;
               indicator.setAttribute(
                    "aria-label",
                    `Ver vista ${index + 1} de ${targets.length}`,
               );

               if (index === activeIndex) {
                    indicator.setAttribute("aria-current", "true");
               }

               fragment.appendChild(indicator);
          });

          indicators.replaceChildren(fragment);
     };

     const refresh = () => {
          buildTargets();
          renderIndicators();
          updateActiveIndicator();
     };

     const shouldAutoplay = () =>
          !reducedMotion.matches &&
          !document.hidden &&
          isVisible &&
          !isPointerInside &&
          !isFocused &&
          targets.length > 1;

     const scheduleAutoplay = () => {
          clearAutoplay();

          if (!shouldAutoplay()) return;

          autoplayTimer = window.setTimeout(() => {
               moveBy(1);
               scheduleAutoplay();
          }, AUTOPLAY_DELAY);
     };

     const moveTo = (index, shouldFade = true) => {
          if (!targets.length) return;

          const safeIndex =
               ((index % targets.length) + targets.length) % targets.length;
          const destination = targets[safeIndex];

          if (Math.abs(track.scrollLeft - destination) < 1) return;

          cancelFade();

          if (shouldFade && !reducedMotion.matches) {
               carousel.classList.add("is-fading");

               fadeTimer = window.setTimeout(() => {
                    track.scrollTo({
                         left: destination,
                         behavior: "auto",
                    });

                    requestAnimationFrame(() => {
                         carousel.classList.remove("is-fading");
                         updateActiveIndicator();
                    });
               }, FADE_DURATION);

               return;
          }

          track.scrollTo({
               left: destination,
               behavior: reducedMotion.matches ? "auto" : "smooth",
          });
     };

     const moveBy = (direction) => {
          moveTo(getActiveIndex() + direction);
     };

     previousButton.addEventListener("click", () => {
          moveBy(-1);
     });

     nextButton.addEventListener("click", () => {
          moveBy(1);
     });

     indicators.addEventListener("click", (event) => {
          const indicator = event.target.closest(
               "[data-puestas-carousel-target]",
          );

          if (!indicator) return;

          moveTo(Number(indicator.dataset.puestasCarouselTarget));
     });

     track.addEventListener(
          "scroll",
          () => {
               window.cancelAnimationFrame(scrollFrame);
               scrollFrame = window.requestAnimationFrame(
                    updateActiveIndicator,
               );
          },
          { passive: true },
     );

     track.addEventListener("keydown", (event) => {
          if (event.key === "ArrowRight") {
               event.preventDefault();
               moveBy(1);
          }

          if (event.key === "ArrowLeft") {
               event.preventDefault();
               moveBy(-1);
          }
     });

     carousel.addEventListener("pointerdown", () => {
          clearAutoplay();
          cancelFade();
     });

     carousel.addEventListener("pointerup", (event) => {
          if (event.pointerType !== "mouse") {
               scheduleAutoplay();
          }
     });

     carousel.addEventListener("pointercancel", scheduleAutoplay);

     carousel.addEventListener("mouseenter", () => {
          isPointerInside = true;
          clearAutoplay();
     });

     carousel.addEventListener("mouseleave", () => {
          isPointerInside = false;
          scheduleAutoplay();
     });

     carousel.addEventListener("focusin", () => {
          isFocused = true;
          clearAutoplay();
     });

     carousel.addEventListener("focusout", () => {
          window.setTimeout(() => {
               isFocused = carousel.contains(document.activeElement);
               scheduleAutoplay();
          });
     });

     track.addEventListener(
          "wheel",
          () => {
               clearAutoplay();
               window.clearTimeout(wheelTimer);
               wheelTimer = window.setTimeout(scheduleAutoplay, 250);
          },
          { passive: true },
     );

     document.addEventListener("visibilitychange", scheduleAutoplay);

     window.addEventListener("resize", () => {
          window.cancelAnimationFrame(resizeFrame);
          resizeFrame = window.requestAnimationFrame(refresh);
     });

     reducedMotion.addEventListener("change", () => {
          cancelFade();
          scheduleAutoplay();
     });

     refresh();

     if ("IntersectionObserver" in window) {
          const visibilityObserver = new IntersectionObserver(
               ([entry]) => {
                    isVisible = entry.isIntersecting && entry.intersectionRatio >= .35;
                    scheduleAutoplay();
               },
               { threshold: [.35] },
          );

          visibilityObserver.observe(carousel);
     } else {
          isVisible = true;
          scheduleAutoplay();
     }
})();