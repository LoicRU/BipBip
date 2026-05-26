import express from "express";
import auth from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import * as controller from "./auth.controller.js";
import {
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "./auth.schemas.js";

const router = express.Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.get("/me", auth, controller.me);
router.patch("/me", auth, validate(updateProfileSchema), controller.updateMe);
router.delete("/me", auth, validate(deleteAccountSchema), controller.deleteMe);

export default router;
