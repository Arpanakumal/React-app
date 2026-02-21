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

export const getRevenueReport = async (req, res) => {
    try {
        const period = req.query.period || 'monthly';

        let groupBy = {};
        if (period === 'weekly') {
            groupBy = { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } };
        } else if (period === 'monthly') {
            groupBy = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
        } else {
            groupBy = { year: { $year: "$createdAt" } };
        }


        const overTimeAgg = await Booking.aggregate([
            { $match: { status: 'completed', commissionPaid: true } },
            { $group: { _id: groupBy, total: { $sum: "$commissionAmount" } } },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1 } }
        ]);

        const overTime = overTimeAgg.map(item => {
            let label = '';
            if (period === 'weekly') label = `W${item._id.week}-${item._id.year}`;
            else if (period === 'monthly') label = `${item._id.month}-${item._id.year}`;
            else label = `${item._id.year}`;
            return { label, total: item.total };
        });


        const topProvidersAgg = await Booking.aggregate([
            { $match: { status: 'completed', commissionPaid: true } },
            { $unwind: "$providerCommissions" },
            { $match: { "providerCommissions.commissionPaid": true } },
            { $group: { _id: "$providerCommissions.providerId", totalCommission: { $sum: "$providerCommissions.commissionAmount" } } },
            { $sort: { totalCommission: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "providers",
                    localField: "_id",
                    foreignField: "_id",
                    as: "providerInfo"
                }
            },
            { $unwind: "$providerInfo" },
            { $project: { _id: 0, name: "$providerInfo.name", totalCommission: 1 } }
        ]);


        const topServicesAgg = await Booking.aggregate([
            { $match: { status: 'completed', commissionPaid: true } },
            { $group: { _id: "$serviceId", totalCommission: { $sum: "$commissionAmount" } } },
            { $sort: { totalCommission: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "_id",
                    as: "serviceInfo"
                }
            },
            { $unwind: "$serviceInfo" },
            { $project: { _id: 0, name: "$serviceInfo.name", totalCommission: 1 } }
        ]);


        const detailedAgg = await Booking.aggregate([
            { $match: { status: 'completed', commissionPaid: true } },
            { $unwind: "$providerCommissions" },
            { $match: { "providerCommissions.commissionPaid": true } },
            {
                $lookup: {
                    from: "providers",
                    localField: "providerCommissions.providerId",
                    foreignField: "_id",
                    as: "providerInfo"
                }
            },
            { $unwind: "$providerInfo" },
            {
                $lookup: {
                    from: "services",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "serviceInfo"
                }
            },
            { $unwind: "$serviceInfo" },
            {
                $project: {
                    bookingId: "$_id",
                    serviceName: "$serviceInfo.name",
                    providerId: "$providerInfo._id",
                    providerName: "$providerInfo.name",
                    commissionAmount: "$providerCommissions.commissionAmount",
                    commissionPaid: "$providerCommissions.commissionPaid",
                    paidAt: "$updatedAt"
                }
            }
        ]);
        res.json({
            success: true,
            data: { overTime, topProviders: topProvidersAgg, topServices: topServicesAgg, detailed: detailedAgg }
        });

    } catch (err) {
        console.error("Revenue report error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getPendingCommissions = async (req, res) => {
    try {
        const bookings = await Booking.find({ status: "completed", commissionPaid: false })
            .populate("serviceId", "name")
            .populate("providerCommissions.providerId", "name email");

        const pendingList = [];

        bookings.forEach(b => {
            b.providerCommissions.forEach(pc => {
                if (!pc.commissionPaid) {
                    pendingList.push({
                        bookingId: b._id,
                        service: b.serviceId?.name || "N/A",
                        providerId: pc.providerId?._id,
                        providerName: pc.providerId?.name || "N/A",
                        commissionAmount: pc.earning * (b.commissionPercent / 100),
                        date: b.createdAt
                    });
                }
            });
        });

        res.json({ success: true, data: pendingList });
    } catch (err) {
        console.error("Get pending commissions error:", err);
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
