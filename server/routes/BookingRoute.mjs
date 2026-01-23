import express from "express";
import { listBookings, createBooking } from "../controllers/BookingController.mjs";

const bookingRouter = express.Router();

bookingRouter.get("/list", listBookings);
bookingRouter.post("/create", createBooking);

export default bookingRouter;
