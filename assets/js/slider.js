const swiper = new Swiper('.swiper', {
  loop: false,
  slidesPerView: 1,
  slidesPerGroup: 1,
  pagination: {
    el: ".swiper__pagination",
    clickable: true,
    bulletClass: "swiper__bullet",
    bulletActiveClass: "swiper__bullet--active",
  },
  breakpoints: {
    1024: {
      slidesPerView: 3,
      slidesPerGroup: 3,
    },
    768: {
      slidesPerView: 2,
      slidesPerGroup: 2,
    }

  },
  navigation: {
    nextEl: ".swiper__control-reverse",
    prevEl: ".swiper__control",
    disabledClass: "swiper__control--disabled"
  }
});
