import * as wishlistService from "../services/wishlistService.js";
import * as productService from "../services/productService.js";
import * as cookiesUtils from "../utils/cookiesUtils.js";

export async function renderWishlist(req, res) {
    const userId = req.user ? req.user.id : null;
    const wishlistIdCookie = req.signedCookies.wishlistId;

    const wishlist = await wishlistService.getWishlist(wishlistIdCookie, userId);

    if (!userId && wishlist.id !== Number(wishlistIdCookie)) {
        cookiesUtils.setCookie(res, "wishlistId", wishlist.id);
    }

    const populatedItems = await Promise.all(
        wishlist.items.map(async (item) => {
            return await productService.getProductById(item.productId);
        })
    );

    const validItems = populatedItems.filter(item => item !== null);

    res.render("wishlist", {
        namePage: "Mis Favoritos",
        wishlistItems: validItems
    });
}

export async function handleToggleWishlist(req, res) {
    const userId = req.user ? req.user.id : null;
    const wishlistIdCookie = req.signedCookies.wishlistId;
    const { productId } = req.body;

    const wishlist = await wishlistService.getWishlist(wishlistIdCookie, userId);

    if (!userId && wishlist.id !== Number(wishlistIdCookie)) {
        cookiesUtils.setCookie(res, "wishlistId", wishlist.id);
    }

    await wishlistService.toggleProduct(wishlist.id, productId);

    const referer = req.get('Referrer') || '/wishlist';
    res.redirect(referer);
}