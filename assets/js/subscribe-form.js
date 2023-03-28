(() => {
  const form = document.getElementById("events-subscribe");
  
  if (form) {
    const submitButton = form.querySelector("button[type=submit]");

    const checkboxes = Array.from(
      form.querySelectorAll("input[type=checkbox]")
    );
    const nameInput = form.querySelector("[id=subscribeName]");
    const emailInput = form.querySelector("[id=subscribeEmail]");

    form.addEventListener("change", () => {
      submitButton.disabled = [
        ...checkboxes.map(({ checked }) => checked),
        !!nameInput.value,
        !!emailInput.value,
      ].some((val) => !val);
    });

    form.addEventListener("submit", (e) => {
      // TODO: handler
      e.preventDefault();
    });
  }
})();
