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

    // El conteo ya fue calculado en cartContext middleware (injectCart)
    // Solo nos aseguramos de que exista un valor por defecto
    if (!res.locals.countCartProducts) {
        res.locals.countCartProducts = 0;
    }
    next();
}