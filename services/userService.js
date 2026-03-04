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

