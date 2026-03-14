import * as wishlistRepository from "../repositories/wishlistRepository.js";

export async function getWishlist(wishlistId, userId = null) {
    let wishlist = null;

    if (userId) {
        wishlist = await wishlistRepository.findByUserId(userId);
    }
    // Si no está logueado, pero tiene una cookie con un wishlistId, la buscamos
    else if (wishlistId) {
        wishlist = await wishlistRepository.findById(wishlistId);
    }
    if (!wishlist) {
        wishlist = await wishlistRepository.create(userId);
    }

    return wishlist;
}

export async function toggleProduct(wishlistId, productId) {
    const wishlist = await wishlistRepository.findById(wishlistId);

    if (!wishlist) {
        throw new Error("No se encontró la lista de deseos");
    }

    const parsedProductId = Number(productId);

    const existingItemIndex = wishlist.items.findIndex(item => item.productId === parsedProductId);

    let newItems = [...wishlist.items];

    if (existingItemIndex > -1) {
        newItems = newItems.filter(item => item.productId !== parsedProductId);
    } else {
        newItems.push({ productId: parsedProductId });
    }

    const updatedWishlist = await wishlistRepository.update(wishlistId, newItems);

    return updatedWishlist;
}

export async function mergeWishlists(guestWishlistId, userId) {
    const guestWishlist = await wishlistRepository.findById(guestWishlistId);

    if (!guestWishlist || guestWishlist.items.length === 0) return;

    let userWishlist = await wishlistRepository.findByUserId(userId);

    if (!userWishlist) {
        userWishlist = await wishlistRepository.create(userId);
    }

    for (const guestItem of guestWishlist.items) {
        const existItem = userWishlist.items.find(
            (userItem) => userItem.productId === guestItem.productId
        );

        if (!existItem) {
            userWishlist.items.push(guestItem);
        }
    }

    await wishlistRepository.update(userWishlist.id, userWishlist.items);
    // Nota: Opcionalmente se podría eliminar el guestWishlist, similar a cómo funciona el carrito.
}