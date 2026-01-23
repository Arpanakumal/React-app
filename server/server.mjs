import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import ServiceRouter from './routes/ServiceRoute.mjs';
import userRouter from './routes/UserRoute.mjs';
import bookingRouter from './routes/BookingRoute.mjs';
import providerRouter from './routes/ProviderRoute.mjs';


const app = express();
app.use(express.json());
app.use(cors());

const connectDB = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
};


(async () => {
    await connectDB();

    app.use("/api/Service", ServiceRouter);
    app.use("/images", express.static('uploads'));
    app.use("/api/user", userRouter);
    app.use("/api/Booking", bookingRouter);
    app.use("/api/Provider", providerRouter);

    app.get('/', (req, res) => {
        res.send('✅ Backend is running!');
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
