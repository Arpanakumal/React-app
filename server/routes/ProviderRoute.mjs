import express from "express";
import multer from "multer";
import { addProvider } from "../controllers/ProviderController.mjs";

const providerRouter = express.Router();
const upload = multer({ dest: "uploads/" });

// Add provider (signup)
providerRouter.post("/add", upload.single("image"), addProvider);


export default providerRouter;
