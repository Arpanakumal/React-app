
import express from "express";
import authmiddleware from "../middleware/authMiddleware.mjs";
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


const bookingRouter = express.Router();

bookingRouter.post("/create", authmiddleware, createBooking);
bookingRouter.post("/accept", authmiddleware, acceptBooking);
bookingRouter.post("/reject", authmiddleware, rejectBooking);


bookingRouter.get("/list", listBookings);
bookingRouter.get("/provider", authmiddleware, listBookingsForProvider);
bookingRouter.get("/user", authmiddleware, listBookingsForUser);
bookingRouter.patch("/:bookingId/cancel", authmiddleware, cancelBooking);
bookingRouter.put("/complete/:id", authmiddleware, completeBooking);

bookingRouter.post("/rate", authmiddleware, rateProvider);

bookingRouter.get("/:id", authmiddleware, getBookingById);
bookingRouter.put("/update/:id", authmiddleware, updateBookingStatus);


export default bookingRouter;
