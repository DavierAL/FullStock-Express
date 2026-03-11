import { Router } from "express";
import * as profileController from "../controllers/profileController.js";

const router = Router();

router.get("/profile", profileController.renderProfile);

router.post("/profile", profileController.handleUpdateProfile);

export default router;