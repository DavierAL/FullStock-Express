import { updateBadge } from "./header.js";

const addToCartForm = document.querySelector('[data-js="add-to-cart-form"]');

if (addToCartForm) {
  addToCartForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.submitter;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Agregando...";

    try {
      const formData = new FormData(addToCartForm);
      const url = addToCartForm.action;
      const plainObject = Object.fromEntries(formData);
      const body = JSON.stringify(plainObject);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Error en el servidor");
      }

      const { cart } = await response.json();
      updateBadge(cart);

    } catch (error) {
      console.error("Error during fetch:", error);
      addToCartForm.submit();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
