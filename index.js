
setTimeout(function () {
     var headID = document.getElementsByTagName("head")[0];
     var newScript = document.createElement('script');
     newScript.type = 'text/javascript';
     // newScript.src = 'http://www.somedomain.com/somescript.js';
     newScript.src = "https://optin.myperfit.com/res/js/fiestapolenta/uTNllBzR.js"
     headID.appendChild(newScript);
}, 15000); // 15 segundos de delay para mostrar el popup

function cambiarImagenPorHora() {
     const ahora = new Date();
     const hora = ahora.getHours();
     const imagen390 = document.getElementById('img__festival__390');
     const imagen576 = document.getElementById('img__festival__576');
     const imagen768 = document.getElementById('img__festival__768');
     const imagen990 = document.getElementById('img__festival__990');
     const imagen1440 = document.getElementById('img__festival__1440');
     const imagen1920 = document.getElementById('img__festival__1920');


     if (hora >= 0 && hora < 12) {
          imagen390.src = '/imgs/seccion-festival-amanecer/bg-390-amanecer.png';
          imagen390.alt = 'Poster del Festival Polenta - Amanecer';

          imagen576.src = '/imgs/seccion-festival-amanecer/bg-576-amanecer.png';
          imagen576.alt = 'Poster del Festival Polenta - Amanecer';

          imagen768.src = '/imgs/seccion-festival-amanecer/bg-768-amanecer.png';
          imagen768.alt = 'Poster del Festival Polenta - Amanecer';

          imagen990.src = '/imgs/seccion-festival-amanecer/bg-990-amanecer.png';
          imagen990.alt = 'Poster del Festival Polenta - Amanecer';

          imagen1440.src = '/imgs/seccion-festival-amanecer/bg-1440-amanecer.png';
          imagen1440.alt = 'Poster del Festival Polenta - Amanecer';

          imagen1920.src = '/imgs/seccion-festival-amanecer/bg-1920-amanecer.png';
          imagen1920.alt = 'Poster del Festival Polenta - Amanecer';
     } else {
          imagen390.src = '/imgs/seccion-festival/bg-390.png';
          imagen390.alt = 'Poster del Festival Polenta - Atardecer';

          imagen576.src = '/imgs/seccion-festival/bg-576.png';
          imagen576.alt = 'Poster del Festival Polenta - Atardecer';

          imagen768.src = '/imgs/seccion-festival/bg-768.png';
          imagen768.alt = 'Poster del Festival Polenta - Atardecer';

          imagen990.src = '/imgs/seccion-festival/bg-990.png';
          imagen990.alt = 'Poster del Festival Polenta - Atardecer';

          imagen1440.src = '/imgs/seccion-festival/bg-1440.png';
          imagen1440.alt = 'Poster del Festival Polenta - Atardecer';

          imagen1920.src = '/imgs/seccion-festival/bg-1920.png';
          imagen1920.alt = 'Poster del Festival Polenta - Atardecer';
     }
}

window.onload = cambiarImagenPorHora();

setInterval(cambiarImagenPorHora, 60000);
