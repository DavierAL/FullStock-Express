import { Router } from "express";
import * as cartController from "../controllers/cartController.js";
import * as orderController from "../controllers/orderController.js";

const router = Router();

// Carrito
router.get("/cart", cartController.renderCart);
router.post("/cart/add-item", cartController.addItemToCart);
router.post("/cart/update-item", cartController.updateCartItem);
router.post("/cart/delete-item", cartController.deleteItemFromCart);
router.post("/cart/reorder/:id", cartController.reorder);

// Order & Checkout
router.get("/checkout", orderController.renderCheckout);
router.post("/checkout/place-order", orderController.placeOrder);
router.get("/order-confirmation", orderController.renderOrderConfirmation);

// Rutas para cupones
router.post("/cart/apply-coupon", cartController.applyCoupon);
router.post("/cart/remove-coupon", cartController.removeCoupon);

export default router;
