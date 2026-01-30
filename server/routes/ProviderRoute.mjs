import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import { addProvider, listProviders, updateProvider, toggleProviderStatus } from "../controllers/ProviderController.mjs";
import Provider from "../models/ProviderModel.mjs"; 

const providerRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Add provider (admin only)
providerRouter.post("/add", authAdmin, upload.single("image"), addProvider);

// List all providers
providerRouter.get('/', listProviders);

// Provider details
providerRouter.get('/:id', async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id)
            .populate("servicesOffered", "name"); 

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        res.json({ success: true, data: provider });
    } catch (err) {
        console.error("Error fetching provider by ID:", err);
        res.status(500).json({ success: false, message: err.message });
    }
});


providerRouter.put("/:id", upload.single("image"), updateProvider);

providerRouter.patch("/:id/toggle", toggleProviderStatus);

export default providerRouter;
