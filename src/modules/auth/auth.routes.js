import { Router } from "express";
import * as controller from "./auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

// LOCAL
router.post("/local/signup", controller.signup);
router.post("/local/signin", controller.signin);

// REFRESH
router.post("/refresh-token", controller.refresh);

// ME
router.get("/user/me", authMiddleware, controller.me);

// UPDATE PROFILE
router.put("/user/me", authMiddleware, controller.updateMe);

// LOGOUT
router.delete("/remove-session", authMiddleware, controller.removeSession);

// DELETE USER
router.delete("/user/me", authMiddleware, controller.deleteMe);

export default router;
