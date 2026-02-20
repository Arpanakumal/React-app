import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import authmiddleware from "../middleware/authMiddleware.mjs";
import {
    addProvider,
    loginProvider,
    listProviders,
    getProviderById,
    getDashboardSummary,
    getProviderCommissions,
    getProviderBookingHistory,
    respondToBooking,
    getMyProfile,
    updateMyProfile,
    updateProvider,
    toggleProviderStatus,
    updateAvailability,
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

providerRouter.get("/dashboard-summary", authmiddleware, getDashboardSummary);
providerRouter.get("/commissions", authmiddleware, getProviderCommissions);

providerRouter.get("/booking/history", authmiddleware, getProviderBookingHistory);
providerRouter.get("/profile", authmiddleware, getMyProfile);
providerRouter.get("/commissions", authmiddleware, getProviderCommissions);
providerRouter.put("/profile", authmiddleware, upload.single("image"), updateMyProfile);
providerRouter.put("/availability", authmiddleware, updateAvailability);






providerRouter.patch("/booking/:bookingId/start", authmiddleware, startBooking);
providerRouter.patch("/booking/:bookingId/end", authmiddleware, endBooking);




providerRouter.get("/:id", getProviderById);
providerRouter.put("/:id", authmiddleware, upload.single("image"), updateProvider);

providerRouter.patch("/:id/toggle", toggleProviderStatus);
providerRouter.patch("/booking/respond", authmiddleware, respondToBooking)

providerRouter.get("/", listProviders);

export default providerRouter;
