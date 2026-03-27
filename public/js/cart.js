import { updateBadge } from "./header.js";

function renderQuantityControls(item) {
  const decrementForm =
    item.quantity === 1
      ? `<form action="/cart/delete-item" method="POST">
           <input type="hidden" name="productId" value="${item.product.id}" />
           <button class="button button--sm-icon button--outline" aria-label="Eliminar artículo" type="submit">
             <img src="/images/icons/trash.svg" alt="Eliminar artículo" />
           </button>
         </form>`
      : `<form action="/cart/update-item" method="POST">
           <input type="hidden" name="productId" value="${item.product.id}" />
           <input type="hidden" name="quantity" value="${item.quantity - 1}" />
           <button class="button button--sm-icon button--outline" aria-label="Reducir cantidad" type="submit">
             <img src="/images/icons/minus.svg" alt="Reducir cantidad" />
           </button>
         </form>`;

  return `
    <div class="cart__item-quantity">
      ${decrementForm}
      <span class="cart__item-quantity-display">${item.quantity}</span>
      <form method="post" action="/cart/update-item">
        <input type="hidden" name="productId" value="${item.product.id}">
        <input type="hidden" name="quantity" value="${item.quantity + 1}">
        <button class="button button--sm-icon button--outline" aria-label="Aumentar cantidad" type="submit">
          <img src="/images/icons/plus.svg" alt="Aumentar cantidad" />
        </button>
      </form>
    </div>
  `;
}

function renderCartItem(item) {
  return `
    <div id="product-${item.productId}" class="cart__item" data-js="cart-item">
      <div class="cart__item-image">
        <img src="${item.product.imgSrc}" alt="${item.product.name}" class="cart__item-image-content" />
      </div>
      <div class="cart__item-details">
        <div class="cart__item-header">
          <h2 class="cart__item-title">${item.product.name}</h2>
          <form method="post" action="/cart/delete-item">
            <input type="hidden" name="productId" value="${item.product.id}">
            <button class="button button--sm-icon button--outline" aria-label="Eliminar artículo" type="submit">
              <img src="/images/icons/trash.svg" alt="Eliminar artículo" />
            </button>
          </form>
        </div>
        <div class="cart__item-footer">
          <p class="cart__item-price">Precio: S/ ${(item.product.price / 100).toFixed(2)}</p>
          <p class="cart__item-price">SubTotal: S/ ${(item.subtotal).toFixed(2)}</p>
          ${renderQuantityControls(item)}
        </div>
      </div>
    </div>
  `;
}

function renderCart(cart) {
  if (cart.items.length === 0) {
    return `
      <div style="text-align: center; padding: 3rem 0;">
        <h2 style="margin-bottom: 1rem;">Tu carrito está vacío</h2>
        <div class="cart__action">
          <a class="button button--lg cart__action-button" href="/">Ir a la tienda</a>
        </div>
      </div>
    `;
  }

  const itemsHtml = cart.items.map(renderCartItem).join("");

  const couponsHTML = cart.appliedCoupon
    ? `
      <div class="cart__total" style="font-size: 1.1rem; color: #16a34a; margin-bottom: 1rem;">
        <p style="display: flex; align-items: center; gap: 0.5rem;">
          Descuento (${cart.appliedCoupon.code})
            <form action="/cart/remove-coupon" method="POST" style="display: inline;">
              <button type="submit"
                style="background: transparent; border: none; color: #ef4444; text-decoration: underline; cursor: pointer; font-size: 0.85rem; padding: 0;">Quitar</button>
            </form>
        </p>
        <p>-S/ ${(cart.discount / 100).toFixed(2)}</p>
      </div>
    `
    : `
      <form action="/cart/apply-coupon" method="POST" style="display: flex; gap: 0.5rem; margin: 1rem 0 2rem;">
        <input type="text" name="couponCode" placeholder="Ingresa tu cupón" class="input-field" style="flex: 1; max-width: 300px;" required>
        <button type="submit" class="button button--outline">Aplicar</button>
      </form>
    `;

  return `
    ${itemsHtml}
    <div style="width: 100%; border-top: 2px solid var(--border); margin-top: 2rem; padding-top: 1rem;">
      <div class="cart__total" style="font-size: 1.1rem; color: var(--muted-foreground); margin-bottom: 0.5rem;">
        <p>Subtotal</p>
        <p>S/ ${(cart.subtotal).toFixed(2)}</p>
      </div>
      ${couponsHTML}
      <div class="cart__total" style="font-size: 1.5rem; font-weight: bold;">
        <p>Total Final</p>
        <p>S/ ${(cart.total).toFixed(2)}</p>
      </div>
    </div>
    <div class="cart__action" style="margin-top: 1.5rem;">
      <a class="button button--lg cart__action-button" href="/checkout">Continuar Compra</a>
    </div>
  `;
}

export function mountCart(parent) {
  parent.addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    
    // Disable buttons
    const itemContainer = form.closest('[data-js="cart-item"]');
    if (itemContainer) {
      itemContainer.querySelectorAll("button").forEach((button) => (button.disabled = true));
    }

    const url = form.action;
    const method = form.method;

    try {
      const formData = new FormData(form);
      const plainObject = Object.fromEntries(formData);
      const body = JSON.stringify(plainObject);

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: Object.keys(plainObject).length ? body : undefined, 
      });

      if (!response.ok) {
        throw new Error("Server rejected our request");
      }

      const { cart } = await response.json();
      parent.innerHTML = renderCart(cart);
      updateBadge(cart);
    } catch (e) {
      console.error(e);
      form.submit();
    }
  });
}