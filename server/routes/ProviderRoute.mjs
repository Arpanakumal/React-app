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
    endBooking,
    forgotPassword,
    resetPassword,
    getProviderRatings

} from "../controllers/ProviderController.mjs";

const providerRouter = express.Router();


const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


// AUTH
providerRouter.post("/add", authAdmin, upload.single("image"), addProvider);
providerRouter.post("/login", loginProvider);
providerRouter.post("/forgot-password", forgotPassword);
providerRouter.post("/reset-password", resetPassword);

//  PROVIDER PANEL

providerRouter.get("/commissions", authmiddleware, getProviderCommissions);
providerRouter.get("/dashboard-summary", authmiddleware, getDashboardSummary);
providerRouter.get("/booking/history", authmiddleware, getProviderBookingHistory);
providerRouter.get("/profile", authmiddleware, getMyProfile);
providerRouter.put("/profile", authmiddleware, upload.single("image"), updateMyProfile);
providerRouter.put("/availability", authmiddleware, updateAvailability);

// BOOKINGS
providerRouter.patch("/booking/respond", authmiddleware, respondToBooking);
providerRouter.patch("/booking/:bookingId/start", authmiddleware, startBooking);
providerRouter.patch("/booking/:bookingId/end", authmiddleware, endBooking);

// PUBLIC
providerRouter.get("/", listProviders);

// DYNAMIC LAST ALWAYS
providerRouter.get("/:id/ratings", getProviderRatings);
providerRouter.get("/:id", getProviderById);
providerRouter.put("/:id", authmiddleware, upload.single("image"), updateProvider);
providerRouter.patch("/:id/toggle", toggleProviderStatus);

export default providerRouter;