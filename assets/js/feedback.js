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
    if (typeof ga !== "function") return;
    const args = {
      command: "send",
      hitType: "event",
      category: "Helpful",
      action: "click",
      label: window.location.pathname,
      value: value,
    };
    ga(
      args.command,
      args.hitType,
      args.category,
      args.action,
      args.label,
      args.value
    );
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
