import * as cartService from "../services/cartService.js";
import * as orderService from "../services/orderService.js";
import * as cookiesUtils from "../utils/cookiesUtils.js";
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
    const userId = req.user?.id;
    const productId = req.body.productId;

    const cart = await cartService.addItemToCart(cartId, productId, userId);

    if (!cartId) {
        cookiesUtils.setCookie(res, "cartId", cart.id);
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

// POST /cart/reorder/:id — repite un pedido anterior
export async function reorder(req, res) {
    const cartId = req.cartId;
    const userId = req.user?.id;
    const orderId = Number(req.params.id);

    try {
        const order = await orderService.getOrderById(orderId);
        if (!order) {
            return res.redirect("/orders"); // Si no existe la orden, vuelve a los pedidos
        }

        let updatedCart;
        for (const item of order.items) {
            updatedCart = await cartService.addItemToCart(cartId, item.productId, userId, item.quantity);
        }

        if (!cartId && updatedCart) {
            cookiesUtils.setCookie(res, "cartId", updatedCart.id);
        }
        res.redirect("/cart");

    } catch (error) {
        console.error("Error al repetir el pedido:", error);
        res.redirect("/orders");
    }
}
