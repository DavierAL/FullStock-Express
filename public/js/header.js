export function updateBadge(cart) {
  const count = cart.items.reduce((acc, item) => acc + item.quantity, 0);

  const cartLink = document.querySelector('[data-js="cart-link"]');
  if (!cartLink) return;

  let badge = cartLink.querySelector('[data-js="cart-badge"]');

  if (count > 0) {
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "header-actions__cart-badge";
      badge.dataset.js = "cart-badge";
      cartLink.append(badge);
    }
    badge.textContent = count;
  } else if (badge) {
    badge.remove();
  }
}
