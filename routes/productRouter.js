import { Router } from "express";
import * as productController from "../controllers/productController.js";

const router = Router();

router.get("/search", productController.renderSearchResults);

// Página de producto individual
router.get("/product/:id", productController.renderProduct);

// Categoría con filtro de precios
router.get("/category/:slug", productController.renderProductsByCategory);

export default router;
