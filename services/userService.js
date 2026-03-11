import * as userRepository from "../repositories/userRepository.js";

export async function getUserById(id) {
    return await userRepository.findUserById(id);
}

export async function getUserByEmail(email) {
    return await userRepository.findUserByEmail(email);
}

export async function createUser(userData) {
    return await userRepository.create(userData);
}

export async function updateUser(id, newData) {
    const updatedUser = await userRepository.update(id, newData);

    if (!updatedUser) {
        throw new Error("No se pudo actualizar: Usuario no encontrado");
    }

    return updatedUser;
}

