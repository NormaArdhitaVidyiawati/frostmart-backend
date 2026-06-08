import { Router } from "express";
import * as controller from "./store-registrations.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import upload from "../../middleware/upload.middleware.js";
import multer from "multer";

const router = Router();

router.get("/active", controller.getActiveStore);

router.use(authMiddleware);

const uploadFields = upload.fields([
  { name: "ktp_image", maxCount: 1 },
  { name: "product_proof_1", maxCount: 1 },
  { name: "product_proof_2", maxCount: 1 },
  { name: "bank_qris", maxCount: 1 },
  { name: "ewallet_qris", maxCount: 1 },
]);

// Wrapper agar error multer bisa dikirim sebagai JSON response yang jelas
const uploadMiddleware = (req, res, next) => {
  uploadFields(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Ukuran file terlalu besar. Maksimal 5MB per file.",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload gagal: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
};

router.post("/", uploadMiddleware, controller.registerStore);
router.get("/my", controller.getMyRegistration);
router.put("/:id", uploadMiddleware, controller.updateStore);
router.delete("/:id", controller.deleteStore);

export default router;
