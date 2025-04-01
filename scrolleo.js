
const btnUp = document.querySelector(".arrow__up");
const btnDown = document.querySelector(".arrow__down");
const ticketsSlider = document.querySelector(".tickets__slider");

btnUp.addEventListener("click", () => {
     ticketsSlider.scrollTop -= 602;
})

btnDown.addEventListener("click", () => {
     ticketsSlider.scrollTop += 602;
})