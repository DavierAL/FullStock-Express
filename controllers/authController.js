import * as authService from "../services/authService.js";
import * as cookiesUtils from "../utils/cookiesUtils.js";

export async function renderSignup(req, res) {
    if (req.user) return res.redirect("/");
    res.render("signup");
}

export async function handleSignup(req, res) {
    if (req.user) return res.redirect("/");
    const { email, password, confirmPassword } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const newUser = await authService.signup(normalizedEmail, password, confirmPassword);
        cookiesUtils.setCookie(res, "userId", newUser.id);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("signup", {
            error: error.message,
            values: { email: normalizedEmail }
        });
    }
}

export async function renderLogin(req, res) {
    if (req.user) return res.redirect("/");
    res.render("login");
}

export async function handleLogin(req, res) {
    if (req.user) return res.redirect("/");
    const { email, password } = req.body;

    try {
        const user = await authService.login(email, password);

        cookiesUtils.setCookie(res, "userId", user.id);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("login", {
            error: error.message,
            values: { email }
        });
    }
}

export async function handleLogout(req, res) {
    if (!req.user) return res.redirect("/");
    cookiesUtils.clearCookie(res, "userId");
    res.redirect("/");
}
