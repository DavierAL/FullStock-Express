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

// Procesa el checkout: crea la orden, vacía el carrito y persiste todo
export async function processCheckout(formData) {
    const data = await cartRepository.getRawData();
    const { products, orders } = data;
    const cart = data.carts[0] || { id: 1, items: [] };

    // Enriquecer items con precios actuales del catálogo
    const orderItems = cart.items
        .map((item) => {
            const product = products.find((p) => p.id === parseInt(item.productId));
            if (!product) return null;
            return {
                productId: parseInt(item.productId),
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            };
        })
        .filter(Boolean);

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // ID auto-incremental
    const newOrderId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

    const newOrder = {
        id: newOrderId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        region: formData.region,
        zipCode: formData.zipCode,
        phone: formData.phone,
        items: orderItems,
        total,
        createdAt: new Date().toISOString(),
    };

    data.orders.push(newOrder);

    // Vaciar el carrito
    cart.items = [];
    data.carts[0] = cart;

    await cartRepository.saveRawData(data);

    return newOrder;
}

// Busca una orden por ID
export async function getOrderById(orderId) {
    const data = await cartRepository.getRawData();
    return data.orders.find((o) => o.id === orderId) || null;
}