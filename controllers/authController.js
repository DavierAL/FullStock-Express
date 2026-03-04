import * as authService from "../services/authService.js";
import * as cookiesUtils from "../utils/cookiesUtils.js";

export async function renderSignup(req, res) {
    if (req.user) return res.redirect("/");
    res.render("signup");
}

export async function handleSignup(req, res) {
    if (req.user) return res.redirect("/");
    const { emailBody, password, confirmPassword } = req.body;

    const email = emailBody.trim().toLowerCase();

    try {
        await authService.signup(email, password, confirmPassword);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("signup", {
            error: error.message,
            values: { email }
        });
    }
}

export async function renderLogin(req, res) {
    if (req.user) return res.redirect("/");
    res.render("login");
}

export async function handleLogin(req, res) {
    if (req.user) return res.redirect("/");
    const { emailBody, password } = req.body;

    try {
        const user = await authService.login(emailBody, password);

        cookiesUtils.setCookie(res, "userId", user._id);
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("login", {
            error: error.message,
            values: { email: emailBody }
        });
    }
}

export async function handleLogout(req, res) {
    if (!req.user) return res.redirect("/");
    cookiesUtils.clearCookie(res, "userId");
    res.redirect("/");
}
