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


