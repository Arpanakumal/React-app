
import express from "express";
import authMiddleware from "../middleware/authMiddleware.mjs";
import {
    createBooking,
    listBookings,
    acceptBooking,
    getBookingById,
    updateBookingStatus,
    completeBooking,
    listBookingsForProvider
} from "../controllers/BookingController.mjs";


const bookingRouter = express.Router();

bookingRouter.post("/create", authMiddleware, createBooking);
bookingRouter.post("/accept", authMiddleware, acceptBooking);
bookingRouter.get("/list", listBookings);
bookingRouter.get("/provider", authMiddleware, listBookingsForProvider);
bookingRouter.put("/complete/:id", authMiddleware, completeBooking);

bookingRouter.get("/:id", authMiddleware, getBookingById);
bookingRouter.put("/update/:id", authMiddleware, updateBookingStatus);


export default bookingRouter;
