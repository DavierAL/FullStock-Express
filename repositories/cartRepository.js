import { getData, saveData } from "../data/db.js"

export async function find() {
    const data = await getData();

    if (!data.carts) {
        data.carts = []
    }
    return data.carts[0] || null;
}

export async function update(cartData) {
    const data = await getData();
    data.carts[0] = cartData;
    await saveData(data);

    return cartData;
}

// Expone el objeto de datos completo para operaciones que necesitan
// leer/escribir varias colecciones a la vez (ej: processCheckout)
export async function getRawData() {
    return await getData();
}

export async function saveRawData(data) {
    await saveData(data);
}