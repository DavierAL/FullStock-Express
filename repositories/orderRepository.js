import { getData, saveData, getNextId } from "../data/db.js";

export async function create(order) {
    const db = await getData();

    if (!db.orders) {
        db.orders = [];
    }

    const id = await getNextId("orders");

    const newOrder = {
        id,
        ...order,
        status: "pending",
        createdAt: new Date().toISOString(),
    };

    db.orders.push(newOrder);
    await saveData(db);

    return newOrder;
}

export async function findById(id) {
    const db = await getData();

    if (!db.orders) {
        return null;
    }

    const order = db.orders.find((o) => o.id === id);
    return order || null;
}
