import { Router } from "express";
import * as pageController from "../controllers/pageController.js";

const router = Router();

router.get("/", pageController.renderHome);
router.get("/about", pageController.renderAbout);
router.get("/terms", pageController.renderTerms);
router.get("/privacy", pageController.renderPrivacy);

export default router;
