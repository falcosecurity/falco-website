const copyLinkClickHandler = (link) => {
  navigator.clipboard.writeText(link);

  const toast = $("#toast");

  if (toast.length) {
    const [el] = toast;
    el.classList.remove("d-none");
    el.getElementsByClassName("toast__content")[0].innerText =
      "Link copied to clipboard";

    toast.toast("show");
  }
};

document
  .querySelectorAll("[data-faq-id]")
  .forEach((el) =>
    el.addEventListener("click", (e) =>
      copyLinkClickHandler(
        `${window.location.origin}/about/faq/#${el.getAttribute("data-faq-id")}`
      )
    )
  );
