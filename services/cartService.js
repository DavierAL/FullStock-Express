import * as cartRepository from "../repositories/cartRepository.js";
import * as productRepository from "../repositories/productRepository.js";
import * as couponRepository from "../repositories/couponRepository.js";

export async function getCart(cartId) {
    const cart = (await cartRepository.find(cartId)) || { id: 1, items: [] };
    const products = await productRepository.findAll();

    const cartItemsDetailed = cart.items.map((item) => {
        const product = products.find((product) => product.id === parseInt(item.productId));
        const subtotal = (product.price * item.quantity) / 100;
        return { ...item, product, subtotal };
    });

    const subtotal = cartItemsDetailed.reduce(
        (acumulador, item) => acumulador + item.subtotal,
        0,
    );

    let discount = 0;
    let appliedCoupon = null;

    if (cart.couponCode) {
        const coupon = await couponRepository.findByCode(cart.couponCode);
        if (coupon) {
            discount = (subtotal * coupon.discountPercentage) / 100;
            appliedCoupon = coupon;
        }
    }

    const total = subtotal - discount;

    return {
        items: cartItemsDetailed,
        subtotal,
        discount,
        total,
        appliedCoupon
    };
}

export async function applyCoupon(cartId, code) {
    const cart = await cartRepository.find(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    const coupon = await couponRepository.findByCode(code);
    if (!coupon) throw new Error("Cupón inválido o expirado");

    cart.couponCode = coupon.code;
    await cartRepository.update(cart);
    return cart;
}

export async function removeCoupon(cartId) {
    const cart = await cartRepository.find(cartId);
    if (!cart) return;

    cart.couponCode = null;
    await cartRepository.update(cart);
    return cart;
}

// function para buscar el carrito dependiendo si es por id o por userId
export async function getOrCreateCart(cartId, userId = null) {
    let cart; // undefined

    // cuando existe un cartId
    if (cartId) {
        cart = await cartRepository.find(cartId);
    }

    // Cuando no encontro cart por el cartId, Pero el usuario esta logueado
    if (!cart && userId) {
        cart = await cartRepository.findByUserId(userId);
    }

    // Cuando no tiene cartId, puede tener userId, CREAMOS UN CARRITO
    if (!cart) {
        cart = await cartRepository.create(userId);
    }

    return cart;
}

export async function addItemToCart(cartId, productId, userId = null, quantityToAdd = 1) {
    productId = parseInt(productId);
    quantityToAdd = parseInt(quantityToAdd) || 1;
    const cart = await getOrCreateCart(cartId, userId);

    // Buscamos el producto que el usuario agrego al carrito de compras
    const cartItem = cart.items.find(
        (product) => product.productId === productId
    );

    if (cartItem) {
        cartItem.quantity += quantityToAdd;
    } else {
        cart.items.push({ productId, quantity: quantityToAdd });
    }

    const updatedCart = await cartRepository.update(cart);
    return updatedCart;
}

export async function getCartById(id) {
    const cart = await cartRepository.find(id);
    return cart;
}

export async function getCartByUserId(userId) {
    const cart = await cartRepository.findByUserId(userId);
    return cart;
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

export async function mergeCarts(guestCartId, userId) {
    const guestCart = await cartRepository.find(guestCartId);

    if (!guestCart || guestCart.items.length === 0) return;

    let userCart = await cartRepository.findByUserId(userId);

    if (!userCart) {
        userCart = await cartRepository.create(userId);
    }

    for (const guestItem of guestCart.items) {
        // Hacemos una busqueda para verificar si el item del carrito huerfano se encuentra en mi carrito de usuario logueado
        const existItem = userCart.items.find(
            (userItem) => userItem.productId === guestItem.productId,
        );

        if (existItem) {
            existItem.quantity += guestItem.quantity;
        } else {
            userCart.items.push(guestItem);
        }
    }

    // Actualizamos nuestra data
    await cartRepository.update(userCart);

    // Eliminamos el carrito de invitado
    await cartRepository.destroy(guestCartId);
}
