
import * as cartService from "../services/cartService.js";
import { clearCookie } from "../utils/cookiesUtils.js";

function injectCart(req, res, cart) {
    req.cart = cart;
    req.cartId = cart.id;
    res.locals.cartItemsCount = cart.items.reduce(
        (total, item) => total + item.quantity,
        0,
    );
}

export async function cartContext(req, res, next) {
    const cartIdCookie = req.signedCookies.cartId; //undefined, false, s%3A2.n%2FOmA0Ddcl3GNnfpEAtb%2F9Awl6fdIeo8tffBj2LabEc

    req.cart = null;
    req.cartId = null;
    res.locals.cartItemsCount = 0;

    // Caso1 : Existe un usuario logueado -> buscamos el carrito por userId
    if (req.user) {
        if (!cartIdCookie) clearCookie(res, "cartId");
        const cart = await cartService.getCartByUserId(req.user.id);
        if (!cart) return next();

        injectCart(req, res, cart);

        return next();
    }

    // Caso 2: la cookie esta corrompida
    if (cartIdCookie === false) {
        clearCookie(res, "cartId");
        return next();
    }

    // Caso 3: Cuando es un usuario invitado y no tiene cartId
    if (!cartIdCookie) {
        return next();
    }

    // Caso 4: Cuando somos usuario invitado y tenemos una cartId Valida
    const cart = await cartService.getCartById(parseInt(cartIdCookie));
    if (!cart) {
        clearCookie(res, "cartId");
    } else {
        injectCart(req, res, cart);
    }

    // req.cartId = cartIdCookie ? Number(cartIdCookie) : null;

    next();
}