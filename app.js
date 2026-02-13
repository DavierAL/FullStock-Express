import express from "express";
import expressLayouts from "express-ejs-layouts";
import {
  readData,
  writeData,
  parsePriceToCents,
  validationsPrices,
} from "./utils/utils.js";

// Puerto de escucha de peticiones
const PORT = process.env.PORT || 3000;

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
  const currentPath = req.path;
  res.locals.namePage = pageTitleByPath[currentPath] || "Full Stock";

  try {
    const data = await readData();
    res.locals.countCartProducts = data.carts[0]
      ? data.carts[0].items.reduce((total, item) => total + item.quantity, 0)
      : 0;
  } catch {
    res.locals.countCartProducts = 0;
  }

  next();
});

// Rutas
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/category/:slug", async (req, res) => {
  try {
    const { slug: categorySlug } = req.params;
    const {
      minPrice: minPriceQuery,
      maxPrice: maxPriceQuery,
      error: errorQuery,
    } = req.query;

    const error = errorQuery === "true";

    // Validar los queries Strings
    const minPrice = parsePriceToCents(minPriceQuery)
      ? minPriceQuery
      : -Infinity;
    const maxPrice = parsePriceToCents(maxPriceQuery)
      ? maxPriceQuery
      : Infinity;

    const data = await readData();
    const { categories, products } = data;

    // Obtenemos el id de la category que el usuario clickeo
    const categoryFind = categories.find(
      (category) =>
        category.slug.toLowerCase() === categorySlug.toLowerCase(),
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
  } catch (err) {
    console.error("Error en /category/:slug:", err);
    res.status(500).render("404", {
      namePage: "Error",
      title: "Error del servidor",
      message: "Ocurrió un error inesperado. Intenta de nuevo.",
      path: "/",
    });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readData();
    const { products } = data;

    // Buscamos el producto por su ID
    const foundProduct = products.find(
      (product) => product.id === parseInt(id),
    );

    if (!foundProduct) {
      return res.status(404).render("404", {
        namePage: "Error",
        title: "Página no encontrada",
        message: "Producto no encontrado",
        path: "/",
      });
    }

    res.render("product", {
      namePage: "Producto",
      product: foundProduct,
    });
  } catch (err) {
    console.error("Error en /product/:id:", err);
    res.status(500).render("404", {
      namePage: "Error",
      title: "Error del servidor",
      message: "Ocurrió un error inesperado. Intenta de nuevo.",
      path: "/",
    });
  }
});

app.post("/cart/add-product", async (req, res) => {
  try {
    const { productId, pathProduct } = req.body;
    const data = await readData();
    const { products, carts } = data;

    // Buscamos el producto que el usuario agrego al carrito
    const foundProduct = products.find(
      (product) => product.id === parseInt(productId),
    );

    if (!foundProduct) {
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
    );

    if (cartItem) {
      cartItem.quantity += 1;
    } else {
      cart.items.push({ productId: parseInt(productId), quantity: 1 });
    }

    // Guardar el carrito en mi objeto de carts
    data.carts[0] = cart;

    // Escribir en mi archivo data.json
    await writeData(data);

    res.redirect(`/product/${productId}`);
  } catch (err) {
    console.error("Error en /cart/add-product:", err);
    res.status(500).render("404", {
      namePage: "Error",
      title: "Error del servidor",
      message: "No se pudo agregar el producto al carrito.",
      path: "/",
    });
  }
});

app.get("/cart", async (req, res) => {
  try {
    const data = await readData();
    const { products, carts } = data;
    const cart = carts[0] || { id: 1, items: [] };

    // Calcular el total del carrito
    const cartItemsDetailed = cart.items
      .map((item) => {
        const product = products.find(
          (product) => product.id === item.productId,
        );

        // Proteger contra productos eliminados del JSON
        if (!product) return null;

        const subtotal = (product.price * item.quantity) / 100;
        return {
          ...item,
          product,
          subtotal,
        };
      })
      .filter(Boolean); // Eliminar items cuyo producto ya no existe

    // Calculando el total del carrito
    const total = cartItemsDetailed.reduce(
      (acumulador, item) => acumulador + item.subtotal,
      0,
    );

    res.render("cart", {
      cartItems: cartItemsDetailed,
      total: total,
    });
  } catch (err) {
    console.error("Error en /cart:", err);
    res.status(500).render("404", {
      namePage: "Error",
      title: "Error del servidor",
      message: "No se pudo cargar el carrito.",
      path: "/",
    });
  }
});

app.post("/cart/update-item", async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const data = await readData();
    const { carts } = data;
    const cart = carts[0] || { id: 1, items: [] };

    const cartItem = cart.items.find(
      (product) => product.productId === parseInt(productId),
    );
    if (cartItem) {
      cartItem.quantity = parseInt(quantity);
    }
    data.carts[0] = cart;

    await writeData(data);

    res.redirect("/cart");
  } catch (err) {
    console.error("Error en /cart/update-item:", err);
    res.redirect("/cart");
  }
});

// Eliminar un producto del carrito
app.post("/cart/delete-item", async (req, res) => {
  try {
    const { productId } = req.body;
    const data = await readData();
    const { carts } = data;
    const cart = carts[0] || { id: 1, items: [] };

    // Filtramos el producto que deseamos eliminar del carrito de compras
    cart.items = cart.items.filter(
      (item) => item.productId !== parseInt(productId),
    );

    // Guardar el carrito actualizado en mi objeto de carts
    data.carts[0] = cart;

    // Escribir data en archivo data.json
    await writeData(data);

    res.redirect("/cart");
  } catch (err) {
    console.error("Error en /cart/delete-item:", err);
    res.redirect("/cart");
  }
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

// Middleware 404 - Captura rutas no definidas
app.use((req, res) => {
  res.status(404).render("404", {
    namePage: "Error 404",
    title: "Página no encontrada",
    message: "La página que buscas no existe.",
    path: "/",
  });
});

// Escuchamos peticiones del cliente.
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
