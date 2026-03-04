import * as userService from "../services/userService.js";
import { clearCookie } from "../utils/cookie.js";

export async function authContext(req, res, next) {
    req.user = null;
    res.locals.user = null;

    const userId = req.cookies.userId;
    if (!userId) return next();

    const user = await userService.getUserById(userId);
    if (!user) {
        clearCookie("userId");
        return next();
    }

    req.user = user;
    res.locals.user = user;
    next();
}