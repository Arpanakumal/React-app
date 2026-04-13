import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import authmiddleware from "../middleware/authMiddleware.mjs";
import auth from "../middleware/auth.mjs";
import { requireRole } from "../middleware/requireRole.mjs";
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

providerRouter.get("/commissions", auth,requireRole("provider"), getProviderCommissions);
providerRouter.get("/dashboard-summary", auth, requireRole("provider"), getDashboardSummary);
providerRouter.get("/booking/history", auth,requireRole("provider"), getProviderBookingHistory);
providerRouter.get("/profile", auth,requireRole("provider"), getMyProfile);
providerRouter.put("/profile", auth, requireRole("provider"),upload.single("image"), updateMyProfile);
providerRouter.put("/availability", auth,requireRole("provider"), updateAvailability);

// BOOKINGS
providerRouter.patch("/booking/respond", auth,requireRole("provider"), respondToBooking);
providerRouter.patch("/booking/:bookingId/start", auth,requireRole("provider"),startBooking);
providerRouter.patch("/booking/:bookingId/end", auth,requireRole("provider"), endBooking);

// PUBLIC
providerRouter.get("/", listProviders);


providerRouter.get("/:id/ratings", getProviderRatings);
providerRouter.get("/:id", getProviderById);
providerRouter.put("/:id", auth, requireRole("provider"),upload.single("image"), updateProvider);
providerRouter.patch("/:id/toggle", toggleProviderStatus);

export default providerRouter;