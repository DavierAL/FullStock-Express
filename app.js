import express from "express";
import expressLayouts from "express-ejs-layouts";
import { readData, writeData } from "./utils/utils.js";
import AppError from "./utils/errorUtils.js";
import errorHandler, { notFoundHandler } from "./middlewares/errorHandler.js";

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
    const { minPrice: minPriceQuery, maxPrice: maxPriceQuery } = req.query;

    const data = await readData();
    const { categories, products } = data;

    // Obtenemos la categoría que el usuario clickeo
    const categoryFind = categories.find(
      (category) =>
        category.slug.toLowerCase() === categorySlug.toLowerCase(),
    );

    if (!categoryFind) {
      throw new AppError("Error categoría", "La categoria que estas buscando no se encuentra disponible", 404);
    }

    // Productos de esta categoría (sin filtrar)
    const categoryProducts = products.filter(
      (product) => product.categoryId === categoryFind.id,
    );

    // Validar los filtros de precio
    let filterError = "";
    let filteredProducts = categoryProducts;

    const hasMinPrice = minPriceQuery !== undefined && minPriceQuery !== "";
    const hasMaxPrice = maxPriceQuery !== undefined && maxPriceQuery !== "";

    if (hasMinPrice || hasMaxPrice) {
      const minVal = parseFloat(minPriceQuery);
      const maxVal = parseFloat(maxPriceQuery);

      if (hasMinPrice && (isNaN(minVal) || minVal < 0)) {
        filterError = `El precio mínimo "${minPriceQuery}" no es válido.`;
      } else if (hasMaxPrice && (isNaN(maxVal) || maxVal < 0)) {
        filterError = `El precio máximo "${maxPriceQuery}" no es válido.`;
      } else if (hasMinPrice && hasMaxPrice && minVal > maxVal) {
        filterError = "El precio mínimo no puede ser mayor al precio máximo.";
      }

      // Solo filtrar si no hay errores
      if (!filterError) {
        const min = hasMinPrice ? minVal : -Infinity;
        const max = hasMaxPrice ? maxVal : Infinity;
        filteredProducts = categoryProducts.filter(
          (product) => product.price / 100 >= min && product.price / 100 <= max,
        );
      }
      // Si hay error, filteredProducts ya tiene todos los productos de la categoría
    }

    res.render("category", {
      namePage: categoryFind.name,
      category: categoryFind,
      products: filteredProducts,
      minPrice: minPriceQuery || "",
      maxPrice: maxPriceQuery || "",
      filterError,
    });
  } catch (err) {
    throw new AppError("Error categoría", "Categoria no encontrada new", 404);
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
      throw new AppError("Error producto", "El producto que estas buscando no se encuentra disponible", 404);
    }

    res.render("product", {
      namePage: "Producto",
      product: foundProduct,
    });
  } catch (err) {
    console.error("Error en /product/:id:", err);
    throw new AppError("Error producto", "Ocurrió un error inesperado. Intenta de nuevo.", 500);
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
      throw new AppError("Error producto", "El producto que estas buscando no se encuentra disponible", 404);
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
    throw new AppError("Error carrito", "No se pudo agregar el producto al carrito.", 500);
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
    throw new AppError("Error carrito", "No se pudo cargar el carrito.", 500);
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
    throw new AppError("Error carrito", "No se pudo actualizar el producto en el carrito.", 500);
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
    throw new AppError("Error carrito", "No se pudo eliminar el producto del carrito.", 500);
  }
});

// Página de checkout - muestra resumen del carrito + formulario
app.get("/checkout", async (req, res) => {
  try {
    const data = await readData();
    const { carts, products } = data;
    const cart = carts[0] || { id: 1, items: [] };

    // Si el carrito está vacío, redirigir al carrito
    if (cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // Enriquecer items del carrito con datos del producto
    const cartItems = cart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          ...item,
          name: product.name,
          imgSrc: product.imgSrc,
          price: product.price,
          subtotal: product.price * item.quantity,
        };
      })
      .filter(Boolean);

    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

    res.render("checkout", {
      namePage: "Checkout",
      cartItems,
      total,
    });
  } catch (err) {
    console.error("Error en GET /checkout:", err);
    throw new AppError("Error checkout", "Ocurrió un error inesperado.", 500);
  }
});

// Procesar la orden - crear orden, vaciar carrito
app.post("/checkout", async (req, res) => {
  try {
    const data = await readData();
    const { carts, products, orders } = data;
    const cart = carts[0] || { id: 1, items: [] };

    if (cart.items.length === 0) {
      return res.redirect("/cart");
    }

    // Crear items de la orden con precios actuales
    const orderItems = cart.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        return {
          productId: item.productId,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Generar ID auto-incremental
    const newOrderId =
      orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1;

    // Crear la orden
    const newOrder = {
      id: newOrderId,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address: req.body.address,
      city: req.body.city,
      country: req.body.country,
      region: req.body.region,
      zipCode: req.body.zipCode,
      phone: req.body.phone,
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
    };

    data.orders.push(newOrder);

    // Vaciar el carrito
    cart.items = [];
    data.carts[0] = cart;

    await writeData(data);

    res.redirect(`/order-confirmation/${newOrderId}`);
  } catch (err) {
    console.error("Error en POST /checkout:", err);
    throw new AppError("Error checkout", "Ocurrió un error al procesar tu orden. Intenta de nuevo.", 500);
  }
});

// Página de confirmación de orden
app.get("/order-confirmation/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = await readData();
    const order = data.orders.find((o) => o.id === parseInt(orderId));

    if (!order) {
      throw new AppError("Error orden", "No se encontró la orden solicitada.", 404);
    }

    res.render("order-confirmation", {
      namePage: "Confirmación",
      orderId: order.id,
    });
  } catch (err) {
    console.error("Error en /order-confirmation:", err);
    throw new AppError("Error confirmación", "Ocurrió un error inesperado.", 500);
  }
});

app.get("/about", (_req, res) => {
  res.render("about");
});

app.get("/terms", (_req, res) => {
  res.render("terms");
});

app.get("/privacy", (_req, res) => {
  res.render("privacy");
});

// Handler para manejar rutas no definidas
app.use(notFoundHandler);

// Handler para manejar errores
app.use(errorHandler);

// Escuchamos peticiones del cliente.
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
