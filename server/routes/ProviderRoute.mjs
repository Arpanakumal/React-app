import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import authmiddleware from "../middleware/authMiddleware.mjs";
import { addProvider,loginProvider, listProviders, updateProvider, toggleProviderStatus ,startBooking,endBooking} from "../controllers/ProviderController.mjs";
import Provider from "../models/ProviderModel.mjs"; 

const providerRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// Add provider (admin only)
providerRouter.post("/add", authAdmin, upload.single("image"), addProvider);

//login
providerRouter.post("/login",loginProvider)


// List 
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
providerRouter.put('/update/:id', updateProvider);

providerRouter.patch("/:id/toggle", toggleProviderStatus);

providerRouter.patch("/booking/:bookingId/start", authmiddleware, startBooking);
providerRouter.patch("/booking/:bookingId/end", authmiddleware, endBooking);

export default providerRouter;
