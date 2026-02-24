import * as productRepository from "../repositories/productRepository.js";

export async function getProductsByCategory(categoryId, filters) {
    const products = await productRepository.findAll();

    // Nullish Coalescing
    const minPrice = filters.minPrice ?? -Infinity;
    const maxPrice = filters.maxPrice ?? Infinity;

    // Obtenemos todos los productos que tengan la categoria encontrada
    const productsFilter = products.filter(
        (product) =>
            product.categoryId === categoryId &&
            product.price >= minPrice &&
            product.price <= maxPrice,
    );

    return productsFilter;
}

export async function getProductById(productId) {
    const product = await productRepository.findById(productId);
    return product;
}