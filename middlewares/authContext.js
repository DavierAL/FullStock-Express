import * as userService from "../services/userService.js";
import { clearCookie } from "../utils/cookiesUtils.js";

export async function authContext(req, res, next) {
    req.user = null;
    res.locals.user = null;

    const userId = req.signedCookies.userId;
    if (!userId) {
        clearCookie(res, "userId");

        return next();
    }

    const user = await userService.getUserById(userId);
    if (!user) {
        clearCookie(res, "userId");
        return next();
    }

    req.user = user;
    res.locals.user = user;
    next();
}