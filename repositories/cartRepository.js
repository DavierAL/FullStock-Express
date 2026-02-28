import { getData, saveData } from "../data/db.js"
import { getNextId } from "../utils/db.js"

export async function find(id) {
    const data = await getData();

    if (!data.carts) {
        data.carts = []
    }
    return data.carts.find(cart => cart.id === id) || null;
}

export async function create() {
    const data = await getData();

    const nextId = await getNextId("carts");

    const newCart = {
        id: nextId,
        items: [],
        total: 0,
    }

    data.carts.push(newCart);
    await saveData(data);

    return newCart;
}

export async function update(cartData) {
    const data = await getData();

    const carIndexFinded = data.carts.findIndex(cart => cart.id === cartData.id);

    if (carIndexFinded !== -1) {
        data.carts[carIndexFinded] = cartData;
    } else {
        data.carts.push(cartData);
    }

    await saveData(data);

    return data.carts.find(cart => cart.id === cartData.id);
}


// Expone el objeto de datos completo para operaciones que necesitan
// leer/escribir varias colecciones a la vez (ej: processCheckout)
export async function getRawData() {
    return await getData();
}

export async function saveRawData(data) {
    await saveData(data);
}