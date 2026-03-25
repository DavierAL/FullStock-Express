const addToCartForm = document.querySelector('[data-js="add-to-cart-form"]');
const cartLink = document.querySelector('[data-js="cart-link"]');

if (addToCartForm) {
  addToCartForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = e.submitter;
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Agregando...";

    try {
      const formData = new FormData(addToCartForm);
      const url = formData.action;
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
      const cartItemsCount = cart.items.reduce(
        (acc, item) => acc + item.quantity,
        0
      );

      let badge = cartLink.querySelector('[data-js="cart-badge"]');

      if (!badge) {
        badge = document.createElement("span");
        badge.className = "header-actions__cart-badge";
        badge.dataset.js = "cart-badge";
        cartLink.append(badge);
      }

      badge.textContent = cartItemsCount;

    } catch (error) {
      console.error("Error during fetch:", error);
      addToCartForm.submit();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}
