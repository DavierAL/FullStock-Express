import * as cartService from "../services/cartService.js";
import * as orderService from "../services/orderService.js";
import * as cookiesUtils from "../utils/cookiesUtils.js";

export async function renderCart(req, res) {
    const cartId = req.cartId;
    const cart = await cartService.getCart(cartId);

    res.render("cart", {
        cartItems: cart.items,
        subtotal: cart.subtotal,
        discount: cart.discount,
        total: cart.total,
        appliedCoupon: cart.appliedCoupon
    });
}

//POST /cart/apply-coupon
export async function applyCoupon(req, res) {
    const cartId = req.cartId;
    const { couponCode } = req.body;

    try {
        await cartService.applyCoupon(cartId, couponCode);
    } catch (error) {
        console.error("Error al aplicar cupón:", error.message);
        // Aquí en el futuro podríamos mandar un mensaje de error a la vista
    }

    res.redirect("/cart");
}

// POST /cart/remove-coupon
export async function removeCoupon(req, res) {
    const cartId = req.cartId;
    await cartService.removeCoupon(cartId);
    res.redirect("/cart");
}

// POST /cart/add-item — agrega un producto al carrito
export async function addItemToCart(req, res) {
    const cartId = req.cartId;
    const userId = req.user?.id;
    const productId = req.body.productId;
    // Es buena práctica capturar la cantidad, por si en el futuro permites agregar más de 1 a la vez
    const quantity = parseInt(req.body.quantity) || 1;

    const cart = await cartService.addItemToCart(cartId, productId, userId, quantity);

    if (!cartId) {
        cookiesUtils.setCookie(res, "cartId", cart.id);
    }

    if (req.headers.accept && req.headers.accept.includes('application/json')) {
        const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
        return res.json({
            success: true,
            message: "Producto agregado al carrito",
            totalItems: totalItems
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

// GET /cart/mini — devuelve solo el HTML del interior del carrito
export async function renderMiniCart(req, res, next) {
    try {
        const cartId = req.cartId;
        const cart = await cartService.getCart(cartId);

        // Renderizamos una vista parcial pequeña sin el diseño completo (layout)
        res.render("partials/mini-cart", {
            cartItems: cart.items,
            total: cart.total,
            layout: false // Esto evita que cargue el header y footer nuevamente
        });
    } catch (error) {
        next(error);
    }
}
