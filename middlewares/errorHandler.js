const ERROR_TITLE = {
    "400": "Error en la petición",
    "401": "Error de autenticación",
    "403": "Error de autorización",
    "404": "Error de recurso no encontrado",
    "500": "Error interno del servidor",
}

export default function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;
    const message = err.message || "Error interno del servidor";
    res.status(status).render("404", {
        title: `${status} - ${ERROR_TITLE[status]} || `,
        message,
        path: "/",
    });
}

export function notFoundHandler(req, res) {
    res.status(404).render("error", {
        namePage: "Error",
        title: "404 - Página no encontrada",
        message: "La página que buscas no existe o ha sido cambiada.",
        path: "/",
    });
}
