import { Router } from "express";
import * as wishlistController from "../controllers/wishlistController.js";

const router = Router();

router.get("/wishlist", wishlistController.renderWishlist);

router.post("/wishlist/toggle", wishlistController.handleToggleWishlist);

export default router;