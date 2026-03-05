import * as cartRepository from "../repositories/cartRepository.js";
import * as productRepository from "../repositories/productRepository.js";

export async function getCart(cartId) {
    const cart = (await cartRepository.find(cartId)) || { id: 1, items: [] };
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

export async function addItemToCart(cartId, productId) {
    productId = parseInt(productId);
    const cart = (await cartRepository.find(cartId));

    if (!cart) {
        const newCart = await cartRepository.create();

        newCart.items.push({ productId, quantity: 1 });

        const updatedCart = await cartRepository.update(newCart);

        return updatedCart;
    }

    //Buscamos el producto que el usuario agrego
    const cartItem = cart.items.find((item) => item.productId === productId);

    if (cartItem) {
        cartItem.quantity += 1;
    } else {
        cart.items.push({ productId, quantity: 1 });
    }

    const updatedCart = await cartRepository.update(cart);
    return updatedCart;
}

export async function updateCartItem(cartId, productId, quantity) {
    productId = parseInt(productId);
    quantity = parseInt(quantity);
    const cart = (await cartRepository.find(cartId));
    const cartItem = cart.items.find((item) => item.productId === productId);
    if (cartItem) {
        cartItem.quantity = quantity;
    }
    await cartRepository.update(cart);
    return cart;
}

export async function deleteItemFromCart(cartId, productId) {
    productId = parseInt(productId);
    const cart = (await cartRepository.find(cartId));
    const cartItem = cart.items.find((item) => item.productId === productId);
    if (cartItem) {
        cart.items = cart.items.filter((item) => item.productId !== productId);
    }
    await cartRepository.update(cart);
    return cart;
}

export async function clearCart(cartId) {
    const cart = await cartRepository.find(cartId);
    if (!cart) return;
    cart.items = [];
    await cartRepository.update(cart);
}

export async function mergeCart(guestCartId, userCartId) {
    if (!guestCartId) return

    const guestCart = await cartRepository.find(guestCartId);

    if (!guestCart || guestCart.items.length === 0) return

    let userCart = await cartRepository.findByUserId(userCartId);

    if (!userCart) {
        userCart = await cartRepository.create(userCartId);
    }


}
