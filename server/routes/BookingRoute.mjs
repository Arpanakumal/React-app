
import express from "express";
import authmiddleware from "../middleware/authMiddleware.mjs";
import {
    requireRole
} from "../middleware/requireRole.mjs";
import auth from "../middleware/auth.mjs";


import {
    createBooking,
    listBookings,
    acceptBooking,
    rejectBooking,
    getBookingById,
    updateBookingStatus,
    completeBooking,
    listBookingsForProvider,
    listBookingsForUser,
    cancelBooking,
    rateProvider
} from "../controllers/BookingController.mjs";
import authAdmin from "../middleware/authAdmin.mjs";


const bookingRouter = express.Router();

bookingRouter.post("/create", authmiddleware, createBooking);
bookingRouter.post("/accept", authmiddleware, acceptBooking);
bookingRouter.post("/reject", authmiddleware, rejectBooking);


bookingRouter.get("/list", listBookings);
bookingRouter.get("/provider", auth, requireRole("provider"), listBookingsForProvider);
bookingRouter.get("/user", authmiddleware, listBookingsForUser);
bookingRouter.patch("/:bookingId/cancel", auth, requireRole("provider"), cancelBooking);
bookingRouter.put("/complete/:id", auth, requireRole("provider"), completeBooking);

bookingRouter.post("/rate", authmiddleware, rateProvider);

bookingRouter.get("/:id", authAdmin, getBookingById);
bookingRouter.put("/update/:id", authmiddleware, updateBookingStatus);


export default bookingRouter;
