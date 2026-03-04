import * as userService from "../services/userService.js";
import AppError from "../utils/errorUtils.js";
import bcrypt from "bcryptjs";

export async function signup(email, password, confirmPassword) {
    if (password !== confirmPassword) {
        throw new AppError("Las contraseñas no coinciden", 400);
    }

    const existUser = await userService.getUserByEmail(email);
    if (existUser) {
        throw new AppError("El usuario ya existe", 400);
    }

    const SALT_ROUNDS = 10;
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await userService.createUser({ email, password: hashedPassword });
    return newUser;
}

export async function login(email, password) {
    const user = await userService.getUserByEmail(email);
    if (!user) {
        throw new AppError("Credenciales no validas", 400);
    }

    //Comparamos contraseñas
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Credenciales no validas", 400);
    }

    return user;
}