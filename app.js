import express from "express";
import expressLayouts from "express-ejs-layouts";
import errorHandler, { notFoundHandler } from "./middlewares/errorHandler.js";
import cookieParser from "cookie-parser";
import pageRouter from "./routes/pageRouter.js";
import productRouter from "./routes/productRouter.js";
import cartRouter from "./routes/cartRouter.js";
import { cartContext } from "./middlewares/cartContext.js";
import { authContext } from "./middlewares/authContext.js";
import { globalHandler } from "./middlewares/globalHandler.js";
import authRouter from "./routes/authRouter.js";

const PORT = process.env.PORT || 3000;

const app = express();

// Parsear datos de formularios HTML
app.use(express.urlencoded({ extended: false }));

//Middleware para manejar cookies
app.use(cookieParser(process.env.COOKIE_SECRET || "mi_secreto_super_seguro"));

//Middleware para manejar autenticación
app.use(authContext);

//Middleware para manejar el carrito
app.use(cartContext);

// Archivos estáticos (CSS, imágenes, JS del cliente)
app.use(express.static("public"));

// Motor de plantillas EJS
app.set("view engine", "ejs");
app.set("views", "./views");

// Layout base compartido por todas las vistas
app.use(expressLayouts);
app.set("layout", "layout");

// Middleware global
app.use(globalHandler);

// Routers
app.use(pageRouter);
app.use(productRouter);
app.use(cartRouter);
app.use(authRouter);

// Ruta no encontrada (404)
app.use(notFoundHandler);

// Manejador de errores global
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
