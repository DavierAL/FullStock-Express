import express from "express";
import expressLayouts from "express-ejs-layouts";
import { AppError } from "./utils/errorUtils.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { getData, saveData } from "./data/db.js";
import * as productController from "./controllers/productController.js";
import * as pageController from "./controllers/pageController.js";

// Puerto de escucha de peticiones
const PORT = 3000;

// Iniciar Servidor
const app = express();

// Parsear los datos de un formulario
app.use(express.urlencoded({ extended: false }));

// Middleware para archivos estaticos
app.use(express.static("public"));

// Para trabajar con plantillas ejs
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware para usar ejs-layouts
app.use(expressLayouts);
app.set("layout", "layout");

// Middleware para definir el título de la página (namePage) en todas las vistas
const pageTitleByPath = {
  "/": "Inicio",
  "/cart": "Carrito",
  "/checkout": "Checkout",
  "/order-confirmation": "Confirmación de compra",
  "/about": "Quienes somos",
  "/terms": "Términos y Condiciones",
  "/privacy": "Política de Privacidad",
};

app.use(async (req, res, next) => {
  const path = req.path;
  res.locals.namePage = pageTitleByPath[path] || "Full Stock";

  // Leer mi archivo data.json
  const data = await getData();

  res.locals.countCartProducts = data.carts[0]
    ? data.carts[0].items.reduce((total, item) => total + item.quantity, 0)
    : 0;
  next();
});

// Rutas Estáticas
app.get("/", pageController.renderHome);

app.get("/about", pageController.renderAbout);

app.get("/terms", pageController.renderTerms);

app.get("/privacy", pageController.renderPrivacy);

// Rutas dinámicas
app.get("/category/:slug", productController.renderProductsByCategory);

app.get("/product/:id", productController.renderProduct);

app.post("/cart/add-product", async (req, res) => {
  const { productId } = req.body;

  // Leer mi archivo data.json
  const data = await getData();

  const { products, carts } = data;

  // Buscamos el producto que el usuario agrego al carrito
  const productFinded = products.find(
    (product) => product.id === parseInt(productId),
  );

  if (!productFinded) {
    throw new AppError(
      "El producto seleccionado no se encuentra disponible",
      404,
    );
  }

  const cart = carts[0] || { id: 1, items: [] };

  // Buscamos el producto que el usuario agrego al carrito de compras
  const cartItem = cart.items.find(
    (product) => product.productId === parseInt(productId),
  ); // { productId: 2, quantity: 1 }

  if (cartItem) {
    cartItem.quantity += 1;
  } else {
    cart.items.push({ productId: parseInt(productId), quantity: 1 });
  }

  // Guardar el carrito en mi objeto de carts
  data.carts[0] = cart;

  // Escribir en mi archivo data.json
  await saveData(data);

  res.redirect(`/product/${productId}`);
});

app.get("/cart", async (req, res) => {
  // Leer mi archivo data.json
  const data = await getData();

  const { products, carts } = data;
  const cart = carts[0] || { id: 1, items: [] };

  //calcular el total del carrito
  const cartItemsDetailed = cart.items.map((item) => {
    const product = products.find((product) => product.id === item.productId);

    //hallando subtotal de cada producto
    const subtotal = (product.price * item.quantity) / 100;

    return {
      ...item,
      product,
      subtotal,
    };
  });

  //  calculando en total del carrito
  const total = cartItemsDetailed.reduce(
    (acumulador, item) => acumulador + item.subtotal,
    0,
  );

  res.render("cart", {
    cartItems: cartItemsDetailed,
    total: total,
  });
});

app.post("/cart/update-item", async (req, res) => {
  const { productId, quantity } = req.body;

  // Leer mi archivo data.json
  const data = await getData();

  const { carts } = data;
  const cart = carts[0] || { id: 1, items: [] };

  const cartItem = cart.items.find(
    (product) => product.productId === parseInt(productId),
  );
  if (cartItem) {
    cartItem.quantity = parseInt(quantity);
  }
  data.carts[0] = cart;

  // Escribir en mi archivo data.json
  await saveData(data);

  res.redirect("/cart");
});

//eliminar un producto del carrito
app.post("/cart/delete-item", async (req, res) => {
  const { productId } = req.body;

  // Leer mi archivo data.json
  const data = await getData();

  const { carts } = data;

  const cart = carts[0] || { id: 1, items: [] };

  // Filtramos el producto que deseamos eliminar del carrito de compras
  cart.items = cart.items.filter(
    (item) => item.productId !== parseInt(productId),
  );

  // Guardar el carrito actualizado en mi objeto de carts
  data.carts[0] = cart;

  // Escribir en mi archivo data.json
  await saveData(data);

  res.redirect("/cart");
});

app.get("/checkout", (_req, res) => {
  res.render("checkout");
});

app.get("/order-confirmation", (_req, res) => {
  res.render("order-confirmation");
});

// Handler para manejar rutas desconocidas
app.use(notFoundHandler);

// Handler para manejar errores
app.use(errorHandler);

// Escuchamos peticiones del cliente.
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
