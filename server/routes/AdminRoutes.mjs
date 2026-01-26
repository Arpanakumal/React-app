// server/routes/AdminRoutes.mjs
import express from "express";
import { addProvider } from "../controllers/AdminController.mjs";
import multer from "multer";

const adminRouter = express.Router();

// Temp storage for uploaded files
const storage = multer.diskStorage({});
const upload = multer({ storage });

adminRouter.post("/add/provider", upload.single("image"), addProvider);

export default adminRouter;
