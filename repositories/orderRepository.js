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

    const orderId = Number(id);
    const order = db.orders.find((o) => o.id === orderId);
    return order || null;
}

export async function findByUserId(userId) {
    const data = await getData();
    const parsedId = Number(userId);

    // Filtramos las órdenes que coincidan con el userId
    // Usamos reverse() para que las más nuevas salgan primero en la lista
    const userOrders = data.orders.filter(order => order.userId === parsedId);
    return userOrders.reverse();
}

