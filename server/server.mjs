import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from "path";
import util from 'util';
dotenv.config({ path: path.resolve('./.env') });

const ServiceRouter = (await import('./routes/ServiceRoute.mjs')).default;
const userRouter = (await import('./routes/UserRoute.mjs')).default;
const providerRouter = (await import('./routes/ProviderRoute.mjs')).default;
const adminRouter = (await import('./routes/AdminRoutes.mjs')).default;
const bookingRouter = (await import('./routes/BookingRoute.mjs')).default;
const messageRouter = (await import('./routes/MessageRoute.mjs')).default;
const blogRouter = (await import('./routes/BlogRoute.mjs')).default;

// console.log("ENV CHECK:", process.env.MONGO_URI, process.env.PORT);

const app = express();
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",

        "https://react-app-homeease.vercel.app",
        "https://react-app-homeease-git-main-arpanakumals-projects.vercel.app"
    ],
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS"
    ],
    credentials: true
}));

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




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
    app.use("/api/blog",blogRouter);
    app.use("/api/user", userRouter);
    app.use("/api/provider", providerRouter);
    app.use("/api/booking", bookingRouter);
    app.use("/api/messages", messageRouter);
    app.use("/api/admin", adminRouter);

    app.get('/', (req, res) => {
        res.send('✅ Backend is running!');
    });

    app.use((err, req, res, next) => {
        console.error('Unhandled error:', util.inspect(err, { depth: 6 }));
        if (res.headersSent) return next(err);

        const responseBody = {
            success: false,
            message: err instanceof Error ? err.message : util.inspect(err, { depth: 3 }),
            error: err.code || null,
        };

        res.status(500).json(responseBody);
    });

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
})();