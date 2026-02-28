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
    const cartId = req.cookies.cartId;
    res.locals.namePage = pageTitleByPath[path] || "Full Stock";

    // Leer mi archivo data.json
    const carFinded = await find(cartId);

    res.locals.countCartProducts = carFinded
        ? carFinded.items.reduce((total, item) => total + item.quantity, 0)
        : 0;
    next();

}