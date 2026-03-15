import * as productRepository from "../repositories/productRepository.js";

export async function getProductsByCategory(categoryId, filters, page = 1, limit = 6) {
    const products = await productRepository.findAll();

    const minPrice = filters.minPrice ?? -Infinity;
    const maxPrice = filters.maxPrice ?? Infinity;

    const searchQuery = filters.search ? filters.search.toLowerCase() : "";
    const tagQuery = filters.tag ? filters.tag.toLowerCase() : "";
    const sortBy = filters.sortBy || "recent";

    const filteredProducts = products.filter((product) => {
        const matchesCategory = product.categoryId === categoryId;
        const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery);

        const matchesTag = tagQuery
            ? (product.tags && product.tags.some(t => t.toLowerCase() === tagQuery))
            : true;

        return matchesCategory && matchesPrice && matchesSearch && matchesTag;
    });

    if (sortBy === "price-asc") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name-desc") {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
        products: paginatedProducts,
        pagination: {
            totalItems,
            totalPages,
            currentPage: page,
            limit,
            startItem: totalItems === 0 ? 0 : startIndex + 1,
            endItem: Math.min(endIndex, totalItems)
        }
    };
}

export async function getProductById(productId) {
    const product = await productRepository.findById(productId);
    return product;
}

export async function searchGlobalProducts(query) {
    const products = await productRepository.findAll();
    if (!query) return [];

    const lowerQuery = query.toLowerCase();

    return products.filter(product => {
        const matchesName = product.name.toLowerCase().includes(lowerQuery);
        const matchesDesc = product.description.toLowerCase().includes(lowerQuery);
        const matchesTag = product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery));

        return matchesName || matchesDesc || matchesTag;
    });
}