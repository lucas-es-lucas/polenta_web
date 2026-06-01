{/* <script> */ }
async function loadTickets() {
     const response = await fetch("/data/tickets.json");
     const tickets = await response.json();

     // console.log(tickets);

     const slider = document.getElementById("ticketsSlider");

     const today = new Date();

     tickets.forEach(ticket => {

          // console.log(ticket);
          // Convertir fecha YYYYMMDD
          const year = ticket.date.slice(0, 4);
          const month = ticket.date.slice(4, 6);
          const day = ticket.date.slice(6, 8);

          const ticketDate = new Date(`${year}-${month}-${day}`);

          // Ocultar tickets viejos
          if (ticketDate < today) return;

          const article = document.createElement("article");
          article.classList.add("ticket");

          article.innerHTML = `
     <figure class="ticket__img__container">
          <img
               class="ticket__img"
               src="/imgs/tickets/${ticket.date}-${ticket.city}.png"
               alt="${ticket.alt}"
          />
          <div class="ticket__filter"></div>
     </figure>

     <button class="cta ticket__button">
          <a
               class="cta__text ticket__link"
               href="${ticket.link}"
               target="_blank"
          >
               QUIERO MI TICKET
          </a>
     </button>
     `;

          // console.log(article);

          slider.appendChild(article);
     });
}

loadTickets();
// </script>
