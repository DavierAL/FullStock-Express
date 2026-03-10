export function setCookie(res, name, value) {
    res.cookie(name, value, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        signed: true
    });
}

export function clearCookie(res, name) {
    res.clearCookie(name);
}
