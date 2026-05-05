import mongoose from "mongoose";
import Booking from "../models/BookingModel.mjs";
import Provider from "../models/ProviderModel.mjs";
import User from "../models/UserModel.mjs";
import jwt from "jsonwebtoken";


export const adminLogin = async (req, res) => {
    const { email, password } = req.body;

    if (
        email?.toLowerCase().trim() === process.env.ADMIN_EMAIL?.toLowerCase().trim() &&
        password?.trim() === process.env.ADMIN_PASSWORD?.trim()
    ) {
        const token = jwt.sign(
            { role: "admin", id: "admin", name: "Admin" },
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

    return res.status(401).json({
        success: false,
        message: "Invalid admin credentials"
    });
};



export const getAdminDashboard = async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const completedJobs = await Booking.countDocuments({ status: "completed" });

        const activeProviders = await Provider.countDocuments({
            available: true,
            "availability.isAvailable": true
        });


        const pendingCommissionAgg = await Booking.aggregate([
            {
                $match: {
                    status: "completed",
                    commissionPaid: false
                }
            },
            {
                $group: {
                    _id: null,
                    totalPending: {
                        $sum: {
                            $round: ["$commissionAmount", 0]
                        }
                    }
                }
            }
        ]);

        const pendingCommission = Math.round(
            pendingCommissionAgg[0]?.totalPending || 0
        );

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("serviceId", "name price_info")
            .populate("providerIds", "name")
            .populate("userId", "name email");

        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select("name email role createdAt");

        const monthlyCommissionAgg = await Booking.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" }
                    },
                    totalCommission: {
                        $sum: {
                            $round: ["$commissionAmount", 0]
                        }
                    }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
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
        res.status(500).json({ success: false, message: err.message });
    }
};


export const getRevenueReport = async (req, res) => {
    try {
        const period = req.query.period || "monthly";

        let groupBy = {};

        if (period === "weekly") {
            groupBy = {
                year: { $year: "$createdAt" },
                week: { $week: "$createdAt" }
            };
        } else if (period === "monthly") {
            groupBy = {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" }
            };
        } else {
            groupBy = { year: { $year: "$createdAt" } };
        }

        const overTime = await Booking.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: groupBy,
                    total: {
                        $sum: {
                            $round: ["$commissionAmount", 0]
                        }
                    }
                }
            }
        ]);

        const formattedOverTime = overTime.map(item => ({
            label:
                period === "weekly"
                    ? `W${item._id.week}-${item._id.year}`
                    : period === "monthly"
                        ? `${item._id.month}-${item._id.year}`
                        : `${item._id.year}`,
            total: Math.round(item.total || 0)
        }));

        const topProviders = await Booking.aggregate([
            { $match: { status: "completed" } },
            { $unwind: "$providerCommissions" },
            {
                $match: {
                    "providerCommissions.accepted": true,
                    "providerCommissions.commissionPaid": true
                }
            },
            {
                $group: {
                    _id: "$providerCommissions.providerId",
                    totalCommission: {
                        $sum: {
                            $round: ["$providerCommissions.commissionShare", 0]
                        }
                    }
                }
            },
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
            {
                $project: {
                    _id: 0,
                    name: "$providerInfo.name",
                    totalCommission: 1
                }
            }
        ]);

        const topServices = await Booking.aggregate([
            { $match: { status: "completed" } },
            {
                $group: {
                    _id: "$serviceId",
                    totalCommission: {
                        $sum: {
                            $round: ["$commissionAmount", 0]
                        }
                    }
                }
            },
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
            {
                $project: {
                    _id: 0,
                    name: "$serviceInfo.name",
                    totalCommission: 1
                }
            }
        ]);

        const detailed = await Booking.aggregate([
            { $match: { status: "completed" } },
            { $unwind: "$providerCommissions" },
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
                    providerName: "$providerInfo.name",
                    commissionAmount: {
                        $round: ["$providerCommissions.commissionShare", 0]
                    },
                    commissionPaid: "$providerCommissions.commissionPaid",
                    paidAt: "$updatedAt"
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                overTime: formattedOverTime,
                topProviders,
                topServices,
                detailed
            }
        });

    } catch (err) {
        console.error("Revenue report error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const getPendingCommissions = async (req, res) => {
    try {
        const bookings = await Booking.find({
            status: "completed",
            commissionPaid: false
        })
            .populate("serviceId", "name")
            .populate("providerCommissions.providerId", "name email");

        const pending = [];

        bookings.forEach(b => {
            b.providerCommissions.forEach(pc => {
                if (pc.accepted && !pc.commissionPaid) {
                    pending.push({
                        bookingId: b._id,
                        service: b.serviceId?.name,
                        providerId: pc.providerId?._id,
                        providerName: pc.providerId?.name,
                        commissionAmount: Math.round(pc.commissionShare || 0),
                        date: b.createdAt
                    });
                }
            });
        });

        res.json({ success: true, data: pending });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const markCommissionPaid = async (req, res) => {
    try {
        const { bookingId, providerId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        const slot = booking.providerCommissions.find(
            pc => pc.providerId?.toString() === providerId
        );

        if (!slot) {
            return res.status(404).json({
                success: false,
                message: "Provider slot not found"
            });
        }

        slot.commissionPaid = true;

        booking.commissionPaid = booking.providerCommissions
            .filter(pc => pc.accepted)
            .every(pc => pc.commissionPaid);

        await booking.save();

        res.json({
            success: true,
            message: "Commission marked as paid"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};