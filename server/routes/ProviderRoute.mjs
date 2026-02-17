import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import authmiddleware from "../middleware/authMiddleware.mjs";
import {
    addProvider,
    loginProvider,
    listProviders,
    getProviderById,
    updateProvider,
    toggleProviderStatus,
    respondToBooking,
    startBooking,
    endBooking
} from "../controllers/ProviderController.mjs";

const providerRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

providerRouter.post("/add", authAdmin, upload.single("image"), addProvider);


providerRouter.post("/login", loginProvider);

providerRouter.get("/", listProviders);

providerRouter.get("/:id", getProviderById);

providerRouter.put("/:id", upload.single("image"), updateProvider);


providerRouter.patch("/:id/toggle", toggleProviderStatus);

providerRouter.patch("/booking/:bookingId/respond",
    authmiddleware,
    respondToBooking
);
providerRouter.patch("/booking/:bookingId/start", authmiddleware, startBooking);
providerRouter.patch("/booking/:bookingId/end", authmiddleware, endBooking);

export default providerRouter;