import express from "express";
import auth from "../../middleware/auth.middleware.js";
import requireRole from "../../middleware/role.middleware.js";

const router = express.Router();

router.get(
  "/dashboard",
  auth,
  requireRole("admin"),
  (req, res) => {
    res.json({ message: "Admin only" });
  }
);

export default router;
