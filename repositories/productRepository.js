import { getData, saveData } from "../data/db.js";

export async function findAll() {
    const data = await getData();
    return data.products;
}

export async function findById(id) {
    const data = await getData();
    const productFinded = data.products.find((product) => product.id === id);
    return productFinded || null;
}
