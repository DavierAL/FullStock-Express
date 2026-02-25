import express from "express";
import expressLayouts from "express-ejs-layouts";
import errorHandler, { notFoundHandler } from "./middlewares/errorHandler.js";
import { getData } from "./data/db.js";

import pageRouter from "./routes/pageRouter.js";
import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRouter.js";

const PORT = process.env.PORT || 3000;

const app = express();

// Parsear datos de formularios HTML
app.use(express.urlencoded({ extended: false }));

// Archivos estáticos (CSS, imágenes, JS del cliente)
app.use(express.static("public"));

// Motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Layout base compartido por todas las vistas
app.use(expressLayouts);
app.set("layout", "layout");

// Middleware global: inyecta namePage y countCartProducts en todas las vistas
const pageTitleByPath = {
  "/": "Inicio",
  "/cart": "Carrito",
  "/checkout": "Checkout",
  "/about": "Quienes somos",
  "/terms": "Términos y Condiciones",
  "/privacy": "Política de Privacidad",
};

app.use(async (req, res, next) => {
  res.locals.namePage = pageTitleByPath[req.path] || "Full Stock";

  try {
    const data = await getData();
    res.locals.countCartProducts = data.carts[0]
      ? data.carts[0].items.reduce((total, item) => total + item.quantity, 0)
      : 0;
  } catch {
    res.locals.countCartProducts = 0;
  }

  next();
});

// Routers
app.use(pageRouter);
app.use(productRouter);
app.use(cartRouter);

// Ruta no encontrada (404)
app.use(notFoundHandler);

// Manejador de errores global
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
