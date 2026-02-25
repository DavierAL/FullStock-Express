import { Router } from "express";
import * as cartController from "../controllers/cartController.js";

const router = Router();

// Carrito
router.get("/cart", cartController.renderCart);
router.post("/cart/add-item", cartController.addItemToCart);
router.post("/cart/update-item", cartController.updateCartItem);
router.post("/cart/delete-item", cartController.deleteItemFromCart);

// Checkout
router.get("/checkout", cartController.renderCheckout);
router.post("/checkout", cartController.processCheckout);

// Confirmación de orden
router.get("/order-confirmation/:orderId", cartController.renderOrderConfirmation);

export default router;
