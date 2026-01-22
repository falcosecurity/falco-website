const initSwiper = () => {
  const swiperElements = document.querySelectorAll(".swiper");
  swiperElements.forEach((element) => {
    if (!element.swiper) {
      const container = element.closest(".swiper__container");
      new Swiper(element, {
        loop: false,
        slidesPerView: 1,
        slidesPerGroup: 1,
        pagination: {
          el: container?.querySelector(".swiper__pagination") || element.querySelector(".swiper__pagination"),
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
          },
        },
        navigation: {
          nextEl: container?.querySelector(".swiper__control-reverse"),
          prevEl: container?.querySelector(".swiper__control"),
          disabledClass: "swiper__control--disabled",
        },
      });
    }
  });
};

// Coordinate DOM readiness and Swiper library availability
let domReady = document.readyState !== 'loading';
let swiperLoaded = typeof Swiper !== 'undefined';

const tryInit = () => {
  if (domReady && swiperLoaded) {
    initSwiper();
  }
};

if (!domReady) {
  document.addEventListener('DOMContentLoaded', () => {
    domReady = true;
    tryInit();
  });
}

// Called by Swiper script onload
window.onSwiperLoaded = () => {
  swiperLoaded = true;
  tryInit();
};

// Try to initialize immediately (handles case where Swiper loaded first)
tryInit();
