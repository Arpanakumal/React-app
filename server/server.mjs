import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import ServiceRouter from './routes/ServiceRoute.mjs';
import userRouter from './routes/UserRoute.mjs';
import path from "path";
import providerRouter from './routes/ProviderRoute.mjs';
import adminRouter from './routes/AdminRoutes.mjs';





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
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
    app.use("/api/Service", ServiceRouter);
    app.use("/images", express.static('uploads'));
    app.use("/api/user", userRouter);

    app.use("/api/provider", providerRouter);
    app.use("/api/admin", adminRouter);

    app.get('/', (req, res) => {
        res.send('✅ Backend is running!');
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();
