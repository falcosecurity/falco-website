const initSwiper = () => {
  const tryInit = () => {
    // Check if both DOM is ready and Swiper is loaded
    if (document.readyState === 'loading' || typeof Swiper === 'undefined') {
      // Wait a bit and try again
      setTimeout(tryInit, 50);
      return;
    }

    // DOM is ready and Swiper is loaded, initialize all swipers
    const swiperElements = document.querySelectorAll(".swiper");
    swiperElements.forEach((element) => {
      // Check if this Swiper instance hasn't been initialized yet
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

  // Start trying to initialize
  tryInit();
};

// Auto-initialize when DOM is ready (if script loads after DOMContentLoaded)
if (document.readyState !== 'loading') {
  initSwiper();
} else {
  document.addEventListener('DOMContentLoaded', initSwiper);
}
