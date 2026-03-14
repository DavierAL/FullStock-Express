import { getData, getNextId, saveData } from "../data/db.js";

export async function findById(id) {
    const data = await getData();
    const parsedId = Number(id);
    const wishlist = data.wishlists.find((w) => w.id === parsedId);
    return wishlist || null;
}

export async function findByUserId(userId) {
    const data = await getData();
    const parsedId = Number(userId);
    const wishlist = data.wishlists.find((w) => w.userId === parsedId);
    return wishlist || null;
}

export async function create(userId = null) {
    const data = await getData();
    const nextId = await getNextId("wishlists");

    const newWishlist = {
        id: nextId,
        userId: userId ? Number(userId) : null,
        items: []
    };

    data.wishlists.push(newWishlist);
    await saveData(data);

    return newWishlist;
}

// Actualizar los productos dentro de la wishlist
export async function update(id, items) {
    const data = await getData();
    const parsedId = Number(id);
    const index = data.wishlists.findIndex((w) => w.id === parsedId);

    if (index === -1) return null;

    data.wishlists[index].items = items;
    await saveData(data);

    return data.wishlists[index];
}