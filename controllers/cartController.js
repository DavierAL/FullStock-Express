import * as cartService from "../services/cartService.js";

// GET /cart — muestra el carrito
export async function renderCart(_req, res) {
    const cart = await cartService.getCart();
    res.render("cart", {
        cartItems: cart.items,
        total: cart.total,
    });
}

// POST /cart/add-item — agrega un producto al carrito
export async function addItemToCart(req, res) {
    const { productId } = req.body;
    await cartService.addItemToCart(productId);
    res.redirect("/cart");
}

// POST /cart/update-item — actualiza la cantidad de un producto
export async function updateCartItem(req, res) {
    const { productId, quantity } = req.body;
    await cartService.updateCartItem(productId, quantity);
    res.redirect("/cart");
}

// POST /cart/delete-item — elimina un producto del carrito
export async function deleteItemFromCart(req, res) {
    const { productId } = req.body;
    await cartService.deleteItemFromCart(productId);
    res.redirect("/cart");
}

// GET /checkout — muestra el resumen del carrito + formulario de compra
export async function renderCheckout(req, res) {
    const cart = await cartService.getCart();

    // Si el carrito está vacío, redirigir al carrito
    if (cart.items.length === 0) {
        return res.redirect("/cart");
    }

    res.render("checkout", {
        namePage: "Checkout",
        cartItems: cart.items,
        total: cart.total,
    });
}

// POST /checkout — procesa la orden y vacía el carrito
export async function processCheckout(req, res) {
    const order = await cartService.processCheckout(req.body);
    res.redirect(`/order-confirmation/${order.id}`);
}

// GET /order-confirmation/:orderId — muestra confirmación de la orden
export async function renderOrderConfirmation(req, res) {
    const orderId = parseInt(req.params.orderId);
    const order = await cartService.getOrderById(orderId);

    if (!order) {
        return res.redirect("/");
    }

    res.render("order-confirmation", {
        namePage: "Confirmación",
        orderId: order.id,
    });
}
