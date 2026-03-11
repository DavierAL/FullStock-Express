import * as categoryService from "../services/categoryService.js";
import * as productService from "../services/productService.js";
import AppError from "../utils/errorUtils.js";
import { parsePriceToCents } from "../utils/utils.js";

export async function renderProductsByCategory(req, res) {
    const { slug } = req.params;

    const {
        minPrice: minPriceQuery,
        maxPrice: maxPriceQuery,
        search,
        tag,
        sortBy
    } = req.query;

    const minPrice = parsePriceToCents(minPriceQuery);
    const maxPrice = parsePriceToCents(maxPriceQuery);

    const filters = {
        minPrice,
        maxPrice,
        search,
        tag,
        sortBy
    };

    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
        throw new AppError("La categoría que esta buscando no se encuentra disponible", 404);
    }

    const products = await productService.getProductsByCategory(category.id, filters);

    res.render("category", {
        namePage: category.name,
        category,
        products,
        minPrice: minPriceQuery || "",
        maxPrice: maxPriceQuery || "",
        searchQuery: search || "",
        tagQuery: tag || "",
        sortByQuery: sortBy || "recent"
    });
}

export async function renderProduct(req, res) {
    const id = parseInt(req.params.id);

    // Buscamos el producto por su ID
    const productFinded = await productService.getProductById(id);

    if (!productFinded) {
        throw new AppError("Producto no encontrado", 404);
    }

    res.render("product", {
        namePage: "Producto",
        product: productFinded,
    });
}

export async function renderSearchResults(req, res) {
    // Capturamos lo que el usuario escribió en la barra de búsqueda (ej. /search?q=taza)
    const query = req.query.q || "";

    const products = await productService.searchGlobalProducts(query);

    // Mostramos una nueva vista llamada "search-results"
    res.render("search-results", {
        namePage: `Resultados para "${query}"`,
        searchQuery: query,
        products
    });
}