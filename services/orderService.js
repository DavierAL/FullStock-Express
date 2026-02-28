import * as orderRepository from "../repositories/orderRepository.js";
import * as cartService from "./cartService.js";
import AppError from "../utils/errorUtils.js";

export async function processCheckout(cartId, shippingInfo) {
    const cart = await cartService.getCart(cartId);

    if (!cart || cart.items.length === 0) {
        throw new AppError("El carrito está vacío. Agrega productos antes de continuar.", 400);
    }

    // Snapshot de los items del carrito al momento de la compra
    const items = cart.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        imgSrc: item.product.imgSrc,
        quantity: item.quantity,
    }));

    const order = {
        items,
        shippingInfo,
        total: cart.total,
    };

    const newOrder = await orderRepository.create(order);

    await cartService.clearCart(cartId);

    return newOrder;
}

export async function getOrderById(id) {
    return await orderRepository.findById(id);
}
