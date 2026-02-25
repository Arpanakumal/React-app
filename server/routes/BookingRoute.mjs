
import express from "express";
import authmiddleware from "../middleware/authMiddleware.mjs";
import {
    createBooking,
    listBookings,
    acceptBooking,
    getBookingById,
    updateBookingStatus,
    completeBooking,
    listBookingsForProvider,
    listBookingsForUser,
    cancelBooking
} from "../controllers/BookingController.mjs";


const bookingRouter = express.Router();

bookingRouter.post("/create", authmiddleware, createBooking);
bookingRouter.post("/accept", authmiddleware, acceptBooking);
bookingRouter.get("/list", listBookings);
bookingRouter.get("/provider", authmiddleware, listBookingsForProvider);
bookingRouter.get("/user", authmiddleware, listBookingsForUser);
bookingRouter.patch("/booking/:bookingId/cancel", authmiddleware, cancelBooking);
bookingRouter.put("/complete/:id", authmiddleware, completeBooking);

bookingRouter.get("/:id", authmiddleware, getBookingById);
bookingRouter.put("/update/:id", authmiddleware, updateBookingStatus);


export default bookingRouter;
