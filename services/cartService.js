import * as cartRepository from "../repositories/cartRepository.js";
import * as productRepository from "../repositories/productRepository.js";

export async function getCart() {
    const cart = (await cartRepository.find()) || { id: 1, items: [] };
    const products = await productRepository.findAll();
    // Modificar los items del carrito de compras
    const cartItemsDetailed = cart.items.map((item) => {
        const product = products.find((product) => product.id === parseInt(item.productId));
        //hallando subtotal de cada producto
        const subtotal = (product.price * item.quantity) / 100;
        return {
            ...item,
            product,
            subtotal,
        };
    });
    //  calculando en total del carrito
    const total = cartItemsDetailed.reduce(
        (acumulador, item) => acumulador + item.subtotal,
        0,
    );
    return {
        items: cartItemsDetailed,
        total,
    };
}

export async function addItemToCart(productId) {
    productId = parseInt(productId);
    const cart = (await cartRepository.find()) || { id: 1, items: [] };

    //Buscamos el producto que el usuario agrego
    const cartItem = cart.items.find((item) => item.productId === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.items.push({ productId, quantity: 1 });
    }

    await cartRepository.update(cart);

    return cart;
}

export async function updateCartItem(productId, quantity) {
    productId = parseInt(productId);
    quantity = parseInt(quantity);
    const cart = (await cartRepository.find()) || { id: 1, items: [] };
    const cartItem = cart.items.find((item) => item.productId === productId);
    if (cartItem) {
        cartItem.quantity = quantity;
    }
    await cartRepository.update(cart);
    return cart;
}

export async function deleteItemFromCart(productId) {
    productId = parseInt(productId);
    const cart = (await cartRepository.find()) || { id: 1, items: [] };
    const cartItem = cart.items.find((item) => item.productId === productId);
    if (cartItem) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
    }
    await cartRepository.update(cart);
    return cart;
}

export async function clearCart() {
    const cart = await cartRepository.find();
    if (!cart) return;
    cart.items = [];
    await cartRepository.update(cart);
}
