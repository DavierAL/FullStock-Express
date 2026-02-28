import * as cartService from "../services/cartService.js";
import * as orderService from "../services/orderService.js";
import AppError from "../utils/errorUtils.js";

// GET /checkout — muestra el resumen del carrito + formulario de compra
export async function renderCheckout(req, res) {
    const cartId = req.cartId;
    const cart = await cartService.getCart(cartId);
    const { items: cartItems, total } = cart || { items: [], total: 0 };

    res.render("checkout", {
        cartItems,
        total,
    });
}

// POST /checkout/place-order — procesa el formulario y crea la orden
export async function placeOrder(req, res) {
    const cartId = req.cartId;
    const shippingInfo = req.body;
    const newOrder = await orderService.processCheckout(cartId, shippingInfo);
    res.redirect(`/order-confirmation?orderId=${newOrder.id}`);
}

// GET /order-confirmation — muestra la confirmación de la orden
export async function renderOrderConfirmation(req, res) {
    const orderId = Number(req.query.orderId);

    if (!orderId) {
        throw new AppError("Se requiere un ID de orden válido.", 400);
    }

    const order = await orderService.getOrderById(orderId);

    if (!order) {
        throw new AppError(`La orden con ID ${orderId} no fue encontrada.`, 404);
    }

    res.render("order-confirmation", {
        orderId,
    });
}
