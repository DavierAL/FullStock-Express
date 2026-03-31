import { Router } from "express";
import * as orderController from "../controllers/orderController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

// Checkout
router.get("/checkout", orderController.renderCheckout);
router.post("/checkout/place-order", orderController.placeOrder);
router.get("/order-confirmation", orderController.renderOrderConfirmation);

// Historial de pedidos (requiere autenticación)
router.get("/orders", requireAuth, orderController.renderOrders);
router.get("/orders/:id", requireAuth, orderController.renderOrderDetail);

export default router;