import { Router } from "express";
import * as profileController from "../controllers/profileController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.get("/profile", requireAuth, profileController.renderProfile);

router.post("/profile", requireAuth, profileController.handleUpdateProfile);

export default router;