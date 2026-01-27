import express from "express";
import { addProvider, loginAll } from "../controllers/AdminController.mjs";
import upload from "../middleware/multer.mjs";
import authAdmin from "../middleware/authAdmin.mjs";

const adminRouter = express.Router();

// Add provider (admin only)
adminRouter.post("/add/provider", authAdmin, upload.single("image"), addProvider);

// Unified login for admin, provider, customer
adminRouter.post("/login", loginAll);

export default adminRouter;
