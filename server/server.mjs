import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import ServiceRouter from './routes/ServiceRoute.mjs';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); 
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    }
};

await connectDB();

app.use("/api/Service",ServiceRouter)

app.get('/', (req, res) => {
    res.send('✅ Backend is running!');
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
