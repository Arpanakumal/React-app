
import express from "express";
import authMiddleware from "../middleware/authMiddleware.mjs";
import { createBooking, listBookings,getBookingById,updateBookingStatus} from "../controllers/BookingController.mjs";

const bookingRouter = express.Router();

bookingRouter.post("/create", authMiddleware, createBooking);
bookingRouter.get("/list",listBookings);
bookingRouter.get("/:id", authMiddleware, getBookingById);
bookingRouter.put("/update/:id", authMiddleware, updateBookingStatus);

export default bookingRouter;
