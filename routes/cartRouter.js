import { Router } from "express";
import * as cartController from "../controllers/cartController.js";

const router = Router();

// Carrito
router.get("/cart", cartController.renderCart);
router.post("/cart/add-item", cartController.addItemToCart);
router.post("/cart/update-item", cartController.updateCartItem);
router.post("/cart/delete-item", cartController.deleteItemFromCart);
router.post("/cart/reorder/:id", cartController.reorder);

// Rutas para cupones
router.post("/cart/apply-coupon", cartController.applyCoupon);
router.post("/cart/remove-coupon", cartController.removeCoupon);

// Ruta para el carrito parcial
router.get("/cart/mini", cartController.renderMiniCart);

export default router;
