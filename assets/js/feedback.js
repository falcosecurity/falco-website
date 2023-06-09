(() => {
  const [yesButton] = document.getElementsByClassName("feedback--answer-yes");
  const [noButton] = document.getElementsByClassName("feedback--answer-no");
  const [yesResponse] = document.getElementsByClassName(
    "feedback--response-yes"
  );
  const [noResponse] = document.getElementsByClassName("feedback--response-no");

  const disableButtons = () => {
    yesButton.disabled = true;
    noButton.disabled = true;
  };

  const sendFeedback = (value) => {
    if (typeof gtag !== 'function') return;
    gtag('event', 'page_helpful', {
      'event_category': 'Helpful',
      'event_label': window.location.pathname,
      'value': value
    });
  };

  if (yesButton)
    yesButton.addEventListener("click", () => {
      yesResponse.classList.remove("d-none");
      disableButtons();
      sendFeedback(1);
    });

  if (noButton)
    noButton.addEventListener("click", () => {
      noResponse.classList.remove("d-none");
      disableButtons();
      sendFeedback(0);
    });
})();
