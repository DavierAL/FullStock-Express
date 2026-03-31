// Middleware: redirige al login si el usuario no está autenticado
export function requireAuth(req, res, next) {
    if (!req.user) {
        return res.redirect("/login");
    }
    next();
}
