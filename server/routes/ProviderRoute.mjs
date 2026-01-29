import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import { addProvider, listProviders, updateProvider, toggleProviderStatus } from "../controllers/ProviderController.mjs";

const providerRouter = express.Router();


const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Add provider (admin only)
providerRouter.post("/add", authAdmin, upload.single("image"), addProvider);
providerRouter.get('/', listProviders);
providerRouter.put("/:id", upload.single("image"), updateProvider);
providerRouter.patch("/:id/toggle", toggleProviderStatus);

export default providerRouter;
