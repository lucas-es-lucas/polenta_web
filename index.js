
setTimeout(function () {
     var headID = document.getElementsByTagName("head")[0];
     var newScript = document.createElement('script');
     newScript.type = 'text/javascript';
     // newScript.src = 'http://www.somedomain.com/somescript.js';
     newScript.src = "https://optin.myperfit.com/res/js/fiestapolenta/uTNllBzR.js"
     headID.appendChild(newScript);
}, 15000); // 15 segundos de delay para mostrar el popup

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
     const goButton = document.querySelector(".go-to-tickets");
     const heroSection = document.querySelector(".hero");

     // Usamos IntersectionObserver para detectar si .hero está visible
     const observer = new IntersectionObserver(
          (entries) => {
               entries.forEach(entry => {
                    if (entry.isIntersecting) {
                         // Hero está visible → ocultamos el botón
                         goButton.classList.remove("show");
                    } else {
                         // Hero no está visible → mostramos el botón
                         goButton.classList.add("show");
                    }
               });
          },
          {
               root: null, // viewport
               threshold: 0, // cualquier visibilidad
          }
     );

     observer.observe(heroSection);
});
