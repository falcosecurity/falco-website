(() => {
  const STORE = "showAnnouncementBar";
  const CLASS_NAME = "announcement-bar";

  const startDate = document.getElementById(
    `${CLASS_NAME}-start-date`
  )?.innerText;
  const endDate = document.getElementById(`${CLASS_NAME}-end-date`)?.innerText;
  const index = document.getElementById(`${CLASS_NAME}-index`)?.textContent;

  const isInDateRange = () => {
    const currentDate = new Date().toISOString();

    if (startDate && currentDate < startDate) return false;
    if (endDate && currentDate > endDate) return false;

    return true;
  };

  const updateStore = () => {
    const { index: storedIndex, show: storedShow } = JSON.parse(
      localStorage.getItem(STORE) || "{}"
    );

    let show;
    if (!storedIndex || storedIndex !== index) {
      show = true;
    }
    if (index === storedIndex) show = storedShow;

    const store = { index, show };
    localStorage.setItem(STORE, JSON.stringify({ index, show }));

    return store;
  };

  const [announcementBar] = document.getElementsByClassName(CLASS_NAME);
  const [navbar] = document.getElementsByClassName("td-navbar");

  let prevScroll = 0;
  const scrollOffset = 50;
  const scrollHandler = () => {
    if (prevScroll < window.scrollY) {
      // scrolling down
      if (window.scrollY > scrollOffset) {
        navbar.classList.remove("td-navbar_transparent");
      }
    } else {
      // scrolling up
      if (window.scrollY < scrollOffset) {
        navbar.classList.add("td-navbar_transparent");
      }
    }
    prevScroll = window.scrollY;
  };

  if (announcementBar) {
    const store = updateStore();
    const inDateRange = isInDateRange();

    const show = () => {
      navbar.classList.add("td-navbar_transparent");
      window.addEventListener("scroll", scrollHandler, false);
    };

    const hide = () => {
      localStorage.setItem(STORE, JSON.stringify({ ...store, show: false }));
      announcementBar.classList.add(`${CLASS_NAME}--hide`);
      navbar.classList.remove("td-navbar_transparent");
      window.removeEventListener("scroll", scrollHandler, false);
    };

    if (store.show && inDateRange) {
      show();
    } else {
      hide();
    }

    return (announcementBarHide = () => {
      hide();
    });
  }
})();
