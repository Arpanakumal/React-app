import express from "express"
import authMiddleware from "../middleware/authMiddleware.mjs"
import { booking } from "../controllers/BookingController.mjs"

const bookingRouter = express.Router();

bookingRouter.post("/booking",authMiddleware,booking)

export default bookingRouter;