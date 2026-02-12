import express from "express";
import expressLayouts from "express-ejs-layouts";
import fs from "node:fs/promises";
import path from "node:path";
import { parsePriceToCents, validationsPrices } from "./utils/utils.js";

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
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");

  // Convertir el json a objeto
  const data = JSON.parse(dataJson);
  res.locals.countCartProducts = data.carts[0]
    ? data.carts[0].items.reduce((total, item) => total + item.quantity, 0)
    : 0;
  next();
});

// Path de mi data.json
const DATA_PATH = path.join("data", "data.json"); // "./data/data.json"

// Rutas
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/category/:slug", async (req, res) => {
  const { slug: categorySlug } = req.params;
  const {
    minPrice: minPriceQuery,
    maxPrice: maxPriceQuery,
    error: errorQuery,
  } = req.query;

  const error = errorQuery === "true";

  // Validar los queries Strings
  const minPrice = parsePriceToCents(minPriceQuery) ? minPriceQuery : -Infinity; // product.price > -Infinity
  const maxPrice = parsePriceToCents(maxPriceQuery) ? maxPriceQuery : Infinity; // product.price < Infinity

  // Leer mi archivo data.json
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");

  // Convertir el json a objeto
  const data = JSON.parse(dataJson);

  // Desestructuramos el data en categories y products
  const { categories, products } = data;

  // Obtenemos el id de la category que el usuario clickeo
  const categoryFind = categories.find(
    (category) => category.slug.toLowerCase() === categorySlug.toLowerCase(), // tazas12345
  );

  if (!categoryFind) {
    return res.status(404).render("404", {
      namePage: "Error categoría",
      title: "Página no encontrada",
      message: "Categoria no encontrada",
      path: "/",
    });
  }

  const validations = validationsPrices(minPriceQuery, maxPriceQuery);
  if (error && validations.title) {
    return res.render("404", {
      namePage: "Error categoría",
      title: validations.title,
      message: validations.message,
      path: req.path,
    });
  }

  // Obtenemos todos los productos que tengan la categoria encontrada
  const productsFilter = products.filter(
    (product) =>
      product.categoryId === categoryFind.id &&
      product.price / 100 >= minPrice &&
      product.price / 100 <= maxPrice,
  );

  res.render("category", {
    namePage: categoryFind.name,
    category: categoryFind,
    products: productsFilter,
    minPrice: minPriceQuery || "",
    maxPrice: maxPriceQuery || "",
  });
});

app.get("/product/:id", async (req, res) => {
  const { id } = req.params;

  // Leer mi archivo data.json
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");

  // Convertir el json a objeto
  const data = JSON.parse(dataJson);

  const { products } = data;

  // Buscamos el producto por su ID
  const productFinded = products.find((product) => product.id === parseInt(id));

  if (!productFinded) {
    return res.status(404).render("404", {
      namePage: "Error",
      title: "Página no encontrada",
      message: "Producto no encontrado",
      path: "/",
    });
  }

  res.render("product", {
    namePage: "Producto",
    product: productFinded,
  });
});

app.post("/cart/add-product", async (req, res) => {
  const { productId, pathProduct } = req.body;

  // Leer mi archivo data.json
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");

  // Convertir el json a objeto
  const data = JSON.parse(dataJson);

  const { products, carts } = data;

  // Buscamos el producto que el usuario agrego al carrito
  const productFinded = products.find(
    (product) => product.id === parseInt(productId),
  );

  if (!productFinded) {
    return res.status(404).render("404", {
      namePage: "Error",
      title: "Producto no encontrado",
      message: "El producto seleccionado no se encuentra disponible",
      path: pathProduct,
    });
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
  await fs.writeFile(DATA_PATH, JSON.stringify(data));

  res.redirect(`/product/${productId}`);
});

app.get("/cart",async (req, res) => {
  
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");

  // Convertir el json a objeto
  const data = JSON.parse(dataJson);

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
  const total = cartItemsDetailed.reduce((acumulador, item) => acumulador + item.subtotal, 0);
  console.log(total);
  res.render("cart", {
    cartItems: cartItemsDetailed,
    total: total,
  });
});

app.post("/cart/update-item", async (req, res) => {
  const { productId, quantity } = req.body;
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");
  const data = JSON.parse(dataJson);
  const { carts } = data;
  const cart = carts[0] || { id: 1, items: [] };

  const cartItem = cart.items.find(
    (product) => product.productId === parseInt(productId),
  );
  if (cartItem) {
    cartItem.quantity = parseInt(quantity);
  } 
  data.carts[0] = cart;

  await fs.writeFile(DATA_PATH, JSON.stringify(data));

  res.redirect("/cart");
});
//eliminar un producto del carrito
app.post("/cart/delete-item", async (req, res) => {
  const { productId } = req.body;
  // Leer mi archivo data.json
  const dataJson = await fs.readFile(DATA_PATH, "utf-8");
  // Convertir el json a objeto
  const data = JSON.parse(dataJson);
  const { carts } = data; 
  const cart = carts[0] || { id: 1, items: [] };
  // Filtramos el producto que deseamos eliminar del carrito de compras
  cart.items = cart.items.filter((item) => item.productId !== parseInt(productId));
  // Guardar el carrito actualizado en mi objeto de carts
  data.carts[0] = cart;
  // Escribir data en archivo data.json
  await fs.writeFile(DATA_PATH, JSON.stringify(data));
  res.redirect("/cart");
});


app.get("/checkout", (req, res) => {
  res.render("checkout");
});

app.get("/order-confirmation", (req, res) => {
  res.render("order-confirmation");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/terms", (req, res) => {
  res.render("terms");
});

app.get("/privacy", (req, res) => {
  res.render("privacy");
});

// Escuchamos peticiones del cliente.
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
