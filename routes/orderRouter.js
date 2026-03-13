import { Router } from "express";
import * as orderController from "../controllers/orderController.js";

const router = Router();

// Ruta para ver el historial completo de órdenes
router.get("/orders", orderController.renderOrders);

// Ruta para ver el detalle de una orden específica
router.get("/orders/:id", orderController.renderOrderDetail);

export default router;