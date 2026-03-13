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
    const userId = req.user ? req.user.id : null;
    const newOrder = await orderService.processCheckout(cartId, shippingInfo, userId);
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

// GET /orders — Lista todas las órdenes del usuario
export async function renderOrders(req, res) {
    // Si no está logueado, al login
    if (!req.user) {
        return res.redirect("/login");
    }

    const orders = await orderService.getOrdersByUserId(req.user.id);

    res.render("orders", {
        namePage: "Mis Pedidos",
        orders
    });
}

// GET /orders/:id — Muestra el detalle de una sola orden
export async function renderOrderDetail(req, res) {
    if (!req.user) {
        return res.redirect("/login");
    }

    const orderId = req.params.id;

    try {
        const order = await orderService.getOrderDetail(orderId, req.user.id);

        res.render("order-detail", {
            namePage: `Pedido #${order.id}`,
            order
        });
    } catch (error) {
        // Si hay error (ej. intenta ver la orden de otro usuario), mostramos una vista de error
        console.error("Error al ver detalle de orden:", error);
        res.status(error.statusCode || 500).render("404", {
            title: "Error al cargar el pedido",
            message: error.message,
            path: "/orders"
        });
    }
}
