import { find } from "../repositories/cartRepository.js";

// Middleware global: inyecta namePage y countCartProducts en todas las vistas
const pageTitleByPath = {
    "/": "Inicio",
    "/cart": "Carrito",
    "/checkout": "Checkout",
    "/about": "Quienes somos",
    "/terms": "Términos y Condiciones",
    "/privacy": "Política de Privacidad",
};

export async function globalHandler(req, res, next) {
    const path = req.path;
    res.locals.namePage = pageTitleByPath[path] || "Full Stock";

    res.locals.countCartProducts = req.cart
        ? req.cart.items.reduce((total, item) => total + item.quantity, 0)
        : 0;
    next();
}