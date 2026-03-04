import { Router } from "express";
import * as authController from "../controllers/authController.js";

const router = Router();

router.get("/signup", authController.renderSignup);
router.post("/signup", authController.handleSignup);

router.get("/login", authController.renderLogin);
router.post("/login", authController.handleLogin);

router.get("/logout", authController.handleLogout);

export default router;