import { Router } from "express";
import * as cartController from "../controllers/cartController.js";
import * as orderController from "../controllers/orderController.js";

const router = Router();

// Carrito
router.get("/cart", cartController.renderCart);
router.post("/cart/add-item", cartController.addItemToCart);
router.post("/cart/update-item", cartController.updateCartItem);
router.post("/cart/delete-item", cartController.deleteItemFromCart);

// Order & Checkout
router.get("/checkout", orderController.renderCheckout);
router.post("/checkout/place-order", orderController.placeOrder);
router.get("/order-confirmation", orderController.renderOrderConfirmation);

export default router;
