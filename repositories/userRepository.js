import { getData, getNextId, saveData } from "../data/db.js";

export async function findUserById(id) {
    const data = await getData();
    const parsedId = Number(id);
    const user = data.users.find((user) => user.id === parsedId);
    return user || null;
}

export async function findUserByEmail(email) {
    const data = await getData();
    const user = data.users.find((user) => user.email === email);
    return user || null;
}

export async function create(userData) {
    const data = await getData();

    const nexId = await getNextId("users");

    const newUser = {
        id: nexId,
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    data.users.push(newUser);
    await saveData(data);

    return newUser;
}

export async function update(id, updatedData) {
    const data = await getData();
    const parsedId = Number(id);

    const userIndex = data.users.findIndex((user) => user.id === parsedId);

    if (userIndex === -1) return null;

    data.users[userIndex] = {
        ...data.users[userIndex],
        ...updatedData,
        updatedAt: new Date().toISOString(), // Actualizamos la fecha de modificación
    };

    await saveData(data);

    return data.users[userIndex];
}

