import mongoose from "mongoose";
import Booking from "../models/BookingModel.mjs";
import Provider from "../models/ProviderModel.mjs";
import User from "../models/UserModel.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";





export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (
        email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim() &&
        password.trim() === process.env.ADMIN_PASSWORD.trim()
    ) {
        const token = jwt.sign(
            { role: "admin", id: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            success: true,
            token,
            role: "admin",
            name: "Admin",
            id: "admin",
        });
    }

    return res.status(401).json({ success: false, message: "Invalid admin credentials" });
};


export const getAdminDashboard = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const completedJobs = await Booking.countDocuments({ status: "completed" });
        const activeProviders = await Provider.countDocuments({ available: true });

        const pendingCommissionAgg = await Booking.aggregate([
            { $match: { status: "completed", commissionPaid: false } },
            { $group: { _id: null, totalPending: { $sum: "$commissionAmount" } } }
        ]);
        const pendingCommission = Math.round(pendingCommissionAgg[0]?.totalPending || 0);

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("serviceId", "name price_info")
            .populate("providerIds", "name")
            .populate("userId", "firstName lastName email");

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5);


        const monthlyCommissionAgg = await Booking.aggregate([
            {
                $match: { status: "completed" }
            },
            {
                $group: {
                    _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                    totalCommission: { $sum: "$commissionAmount" }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        const monthlyCommission = monthlyCommissionAgg.map(item => ({
            year: item._id.year,
            month: item._id.month,
            totalCommission: Math.round(item.totalCommission || 0)
        }));

        res.json({
            success: true,
            data: {
                totalBookings,
                completedJobs,
                activeProviders,
                pendingCommission,
                recentBookings,
                recentUsers,
                monthlyCommission
            }
        });

    } catch (err) {
        console.error("Admin dashboard error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const markCommissionPaid = async (req, res) => {
    try {
        const { bookingId, providerId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });


        const slot = booking.providerCommissions.find(pc => pc.providerId?.toString() === providerId);
        if (!slot) return res.status(404).json({ success: false, message: "Provider commission not found" });

        slot.commissionPaid = true;

        booking.commissionPaid = booking.providerCommissions.every(pc => pc.commissionPaid);

        await booking.save();

        res.json({ success: true, message: "Commission marked as paid", data: booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
