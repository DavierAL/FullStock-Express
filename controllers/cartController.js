import * as cartService from "../services/cartService.js";

// GET /cart — muestra el carrito
export async function renderCart(req, res) {
    const cartId = req.cartId;
    const cart = await cartService.getCart(cartId);

    res.render("cart", {
        cartItems: cart.items,
        total: cart.total,
    });
}

// POST /cart/add-item — agrega un producto al carrito
export async function addItemToCart(req, res) {
    const cartId = req.cartId;
    const productId = req.body.productId;

    const cart = await cartService.addItemToCart(cartId, productId);

    if (!cartId) {
        res.cookie("cartId", cart.id, {
            maxAge: 60 * 60 * 24 * 30,
            httpOnly: true,
        });
    }
    res.redirect("/cart");
}

// POST /cart/update-item — actualiza la cantidad de un producto
export async function updateCartItem(req, res) {
    const cartId = req.cartId;
    const { productId, quantity } = req.body;
    await cartService.updateCartItem(cartId, productId, quantity);
    res.redirect("/cart");
}

// POST /cart/delete-item — elimina un producto del carrito
export async function deleteItemFromCart(req, res) {
    const cartId = req.cartId;
    const { productId } = req.body;
    await cartService.deleteItemFromCart(cartId, productId);
    res.redirect("/cart");
}


