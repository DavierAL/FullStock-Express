import * as categoryService from "../services/categoryService.js";
import * as productService from "../services/productService.js";
import * as wishlistService from "../services/wishlistService.js";
import AppError from "../utils/errorUtils.js";
import { parsePriceToCents } from "../utils/utils.js";

export async function renderProductsByCategory(req, res) {
    const { slug } = req.params;

    const {
        minPrice: minPriceQuery,
        maxPrice: maxPriceQuery,
        search,
        tag,
        sortBy,
        page: pageQuery,
        limit: limitQuery
    } = req.query;

    const minPrice = parsePriceToCents(minPriceQuery);
    const maxPrice = parsePriceToCents(maxPriceQuery);

    const filters = { minPrice, maxPrice, search, tag, sortBy };

    const page = parseInt(pageQuery) || 1;
    const limit = parseInt(limitQuery) || 6;

    const category = await categoryService.getCategoryBySlug(slug);

    if (!category) {
        throw new AppError("La categoría que esta buscando no se encuentra disponible", 404);
    }

    const { products, pagination } = await productService.getProductsByCategory(
        category.id,
        filters,
        page,
        limit
    );

    res.render("category", {
        namePage: category.name,
        category,
        products,
        pagination,
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

    const userId = req.user ? req.user.id : null;
    const wishlistIdCookie = req.signedCookies ? req.signedCookies.wishlistId : null;
    let isInWishlist = false;

    if (userId || wishlistIdCookie) {
        const wishlist = await wishlistService.getWishlist(wishlistIdCookie, userId);
        if (wishlist && wishlist.items) {
            isInWishlist = wishlist.items.some(item => item.productId === id);
        }
    }

    res.render("product", {
        namePage: "Producto",
        product: productFinded,
        isInWishlist
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