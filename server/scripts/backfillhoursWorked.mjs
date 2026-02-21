import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Booking from "../models/BookingModel.mjs"; 

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ DB connection error:", err.message);
        process.exit(1);
    }
};

const backfillhoursWorked = async () => {
    try {
        await connectDB();

        const bookings = await Booking.find({
            status: "completed",
            hoursWorked: { $exists: false },
            startedAt: { $exists: true },
            endedAt: { $exists: true }
        });

        console.log("Found bookings:", bookings.length);

        for (const booking of bookings) {
            const hoursWorked =
                (new Date(booking.endedAt) - new Date(booking.startedAt)) / 3600000;

            booking.hoursWorked = Number(hoursWorked.toFixed(2)); 
            await booking.save();
        }

        console.log("✅ Backfill completed");
        process.exit();
    } catch (err) {
        console.error("❌ Error:", err);
        process.exit(1);
    }
};

backfillhoursWorked();