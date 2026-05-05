import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import Booking from "../models/BookingModel.mjs";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import validator from "validator";
import crypto from 'crypto';
import { calculateProviderEarnings } from "../utils/BookingHelpers.mjs";
import UserModel from "../models/UserModel.mjs";
import { rankProviders } from "../utils/ProviderRanking.mjs";



export const addProvider = async (req, res) => {
    try {
        const { name, phone, email, servicesOffered, defaultCommissionPercent } = req.body;
        const imageFile = req.file;

        if (!name || !phone || !email) {
            return res.status(400).json({
                success: false,
                message: "Name,Phone and email are required",
            });
        }
        if (!phone || !validator.isMobilePhone(phone, 'any')) {
            return res.status(400).json({
                success: false,
                message: "Valid phone number is required",
            });
        }


        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }

        const randomPassword = crypto.randomBytes(4).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        let servicesIds = [];
        if (servicesOffered) {
            servicesIds = JSON.parse(servicesOffered).map(
                (id) => new mongoose.Types.ObjectId(id)
            );
        }

        const provider = new Provider({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            password: hashedPassword,
            servicesOffered: servicesIds,
            image: imageFile ? `/uploads/${imageFile.filename}` : null,
            defaultCommissionPercent: defaultCommissionPercent ? Number(defaultCommissionPercent) : 10,
            isProfileComplete: false,
            available: true,
        });

        await provider.save();

        res.status(201).json({
            success: true,
            message: "Provider account created",
            password: randomPassword,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// LOGIN provider
export const loginProvider = async (req, res) => {
    const { email, password } = req.body;

    try {

        const provider = await Provider.findOne({ email });

        if (!provider) {
            return res.json({ success: false, message: "Invalid email or password" });
        }


        if (!provider.available) {
            return res.json({ success: false, message: "Account is deactivated" });
        }

        const isMatch = await bcrypt.compare(password, provider.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // create tokon
        const token = jwt.sign(
            {
                id: provider._id.toString(),
                role: "provider"
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );


        res.json({
            success: true,
            token,
            role: "provider",
            name: provider.name,
            id: provider._id,
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const listProviders = async (req, res) => {
    try {
        const providers = await Provider.find()
            .populate("servicesOffered", "name");

        const rankedProviders = rankProviders(providers);

        res.json({ success: true, data: rankedProviders });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};




export const getProviderById = async (req, res) => {
    try {
        const provider = await Provider.findById(req.params.id)
            .select("-password")
            .populate("servicesOffered", "name");

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        res.json({ success: true, provider });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};




//update
export const updateProvider = async (req, res) => {
    const { id } = req.params;
    const { name, email, phone, servicesOffered, password } = req.body;

    const provider = await Provider.findById(id);
    if (!provider) {
        return res.status(404).json({ success: false, message: "Provider not found" });
    }

    if (name) provider.name = name.trim();

    if (phone) {
        if (!validator.isMobilePhone(phone, 'any')) {
            return res.status(400).json({ success: false, message: "Invalid phone number" });
        }
        provider.phone = phone.trim();
    }

    if (email && email !== provider.email) {
        const exists = await Provider.findOne({ email, _id: { $ne: id } });
        if (exists) {
            return res.status(400).json({ success: false, message: "Email in use" });
        }
        provider.email = email.trim();
    }

    if (password) {
        provider.password = await bcrypt.hash(password, 10);
    }

    if (servicesOffered) {
        try {
            provider.servicesOffered = JSON.parse(servicesOffered).map(
                (id) => new mongoose.Types.ObjectId(id)
            );
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid services format" });
        }
    }

    if (req.file) {
        provider.image = `/uploads/${req.file.filename}`;
    }

    await provider.save();
    res.json({ success: true, message: "Provider updated" });
};



//actvate/deacrivate

export const toggleProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await Provider.findById(id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        provider.available = !provider.available;
        await provider.save();

        res.json({
            success: true,
            message: provider.available
                ? "Provider activated"
                : "Provider deactivated",
            available: provider.available
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error updating provider status"
        });
    }
};

export const respondToBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId, action } = req.body;

        if (!["accept", "reject"].includes(action)) {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        if (["completed", "cancelled"].includes(booking.status)) {
            return res.status(400).json({ success: false, message: "Booking already closed" });
        }

        let mySlot = booking.providerCommissions.find(pc =>
            pc.providerId?.toString() === providerId
        );

        if (!mySlot) {
            mySlot = booking.providerCommissions.find(pc =>
                !pc.accepted &&
                !(pc.rejectedBy || []).map(id => id.toString()).includes(providerId)
            );
        }

        if (!mySlot) {
            return res.status(400).json({ success: false, message: "No available slot to respond" });
        }

        if (action === "accept") {
            if (mySlot.accepted) {
                return res.status(400).json({ success: false, message: "Already accepted" });
            }

            mySlot.accepted = true;
            mySlot.rejected = false;
            mySlot.providerId = providerId;

            mySlot.rejectedBy = (mySlot.rejectedBy || []).filter(
                id => id.toString() !== providerId
            );
        }

        if (action === "reject") {
            mySlot.accepted = false;
            mySlot.rejected = true;
            mySlot.providerId = null;

            mySlot.rejectedBy = mySlot.rejectedBy || [];

            if (!mySlot.rejectedBy.some(id => id.toString() === providerId)) {
                mySlot.rejectedBy.push(providerId);
            }
        }





        booking.providerIds = booking.providerCommissions
            .filter(pc => pc.accepted)
            .map(pc => pc.providerId);

        const totalAccepted = booking.providerCommissions.filter(pc => pc.accepted).length;
        const totalRequired = booking.providerCount || booking.providerCommissions.length;

        const remainingProviders = totalRequired - totalAccepted;
        const allAccepted = totalAccepted >= totalRequired;


        booking.status = allAccepted ? "accepted" : "pending";

        await booking.save();



        return res.json({
            success: true,
            message: action === "accept" ? "Accepted" : "Rejected",
            data: {
                booking,
                remainingProviders,
                allAccepted
            }
        });

    } catch (err) {
        console.error("respondToBooking error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const startBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isAssigned = booking.providerCommissions.some(pc =>
            pc.providerId?.toString() === providerId && pc.accepted
        );

        if (!isAssigned) {
            return res.status(403).json({ success: false, message: "Not assigned" });
        }

        if (booking.status !== "accepted") {
            return res.status(400).json({ success: false, message: "Must be accepted first" });
        }

        booking.startedAt = new Date();
        booking.status = "in-progress";

        await booking.save();

        res.json({ success: true, message: "Started", data: booking });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const endBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        const isAssigned = booking.providerCommissions.some(pc =>
            pc.providerId?.toString() === providerId && pc.accepted
        );

        if (!isAssigned) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        if (booking.status !== "in-progress") {
            return res.status(400).json({ success: false, message: "Not in progress" });
        }

        booking.endedAt = new Date();

        const hoursWorked =
            (booking.endedAt - booking.startedAt) / 3600000;

        const result = calculateProviderEarnings(booking, hoursWorked);

        booking.providerCommissions = result.booking.providerCommissions;
        booking.finalPrice = result.finalPrice;
        booking.commissionAmount = result.commissionAmount;
        booking.providerEarning = result.providerEarning;

        booking.status = "completed";
        booking.hoursWorked = hoursWorked;

        await booking.save();

        res.json({ success: true, message: "Completed", data: booking });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const getDashboardSummary = async (req, res) => {
    try {
        const providerId = req.user.id;

        const totalBookings = await Booking.countDocuments({
            providerCommissions: {
                $elemMatch: { providerId: new mongoose.Types.ObjectId(providerId) }
            }
        });

        const pendingCommissionsAgg = await Booking.aggregate([
            {
                $match: {
                    "providerCommissions.providerId": new mongoose.Types.ObjectId(providerId),
                    status: "completed",
                    commissionPaid: false
                }
            },
            { $unwind: "$providerCommissions" },
            {
                $match: {
                    "providerCommissions.providerId": new mongoose.Types.ObjectId(providerId),
                    "providerCommissions.accepted": true
                }
            },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: "$providerCommissions.commissionShare" }
                }
            }
        ]);

        const pendingCommission = Math.round(
            pendingCommissionsAgg[0]?.totalPending || 0
        );

        res.json({
            success: true,
            data: {
                totalBookings,
                pendingCommission
            }
        });

    } catch (err) {
        console.error("Error in getDashboardSummary:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const getProviderCommissions = async (req, res) => {
    try {
        const providerId = req.user.id;

        const bookings = await Booking.find({
            "providerCommissions.providerId": providerId,
            status: "completed"
        })
            .populate("serviceId", "name")
            .sort({ endedAt: -1 });

        const formatted = bookings.map(booking => {
            const mySlot = booking.providerCommissions.find(
                pc => pc.providerId?.toString() === providerId && pc.accepted
            );

            if (!mySlot) return null;

            return {
                _id: booking._id,
                service: booking.serviceId?.name || "N/A",
                finalPrice: Math.round(booking.finalPrice || 0),
                commissionPercent: booking.commissionPercent,

                commissionAmount: Math.round(mySlot.commissionShare || 0),
                providerEarning: Math.round(mySlot.earningShare || 0),

                commissionPaid: mySlot.commissionPaid || false,
                endedAt: booking.endedAt
            };
        }).filter(Boolean);

        res.json({ success: true, data: formatted });

    } catch (err) {
        console.error("Error in getProviderCommissions:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getProviderBookingHistory = async (req, res) => {
    try {
        const providerId = req.user.id;

        const bookings = await Booking.find({
            providerIds: providerId,
            status: { $in: ["accepted", "in-progress", "completed"] }
        })
            .populate("serviceId", "name")
            .populate("customer", "name")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


export const getMyProfile = async (req, res) => {
    try {
        const provider = await Provider.findById(req.user.id)
            .select("-password")
            .populate("servicesOffered", "name");

        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        res.json({ success: true, data: provider });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};







export const updateMyProfile = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { name, email, phone, password, servicesOffered } = req.body;

        const provider = await Provider.findById(providerId);
        if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

        if (name) provider.name = name.trim();

        if (phone) {
            if (!validator.isMobilePhone(phone, 'any')) {
                return res.status(400).json({ success: false, message: "Invalid phone number" });
            }
            provider.phone = phone.trim();
        }

        if (email && email !== provider.email) {
            const exists = await Provider.findOne({ email, _id: { $ne: providerId } });
            if (exists) return res.status(400).json({ success: false, message: "Email already in use" });
            provider.email = email.trim();
        }

        if (password) {
            provider.password = await bcrypt.hash(password, 10);
        }

        if (servicesOffered) {
            try {
                provider.servicesOffered = JSON.parse(servicesOffered).map(id => new mongoose.Types.ObjectId(id));
            } catch (err) {
                return res.status(400).json({ success: false, message: "Invalid services format" });
            }
        }

        if (req.file) {
            provider.image = `/uploads/${req.file.filename}`;
        }

        await provider.save();

        res.json({ success: true, message: "Profile updated successfully", data: provider });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};



export const updateAvailability = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { workingDays, startTime, endTime, isAvailable } = req.body;

        const provider = await Provider.findById(providerId);
        if (!provider)
            return res.status(404).json({ success: false, message: "Provider not found" });

        if (!Array.isArray(workingDays)) {
            return res.status(400).json({
                success: false,
                message: "Working days must be an array"
            });
        }

        if (!startTime || !endTime) {
            return res.status(400).json({
                success: false,
                message: "Start time and end time are required"
            });
        }

        if (startTime >= endTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }


        if (!provider.availability) {
            provider.availability = {};
        }

        provider.availability.workingDays = workingDays;
        provider.availability.startTime = startTime;
        provider.availability.endTime = endTime;


        await provider.save();

        res.json({
            success: true,
            message: "Availability updated",
            data: provider.availability
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Valid email is required" });
        }

        const provider = await Provider.findOne({ email });

        if (!provider) {

            return res.json({
                success: true,
                message: "Redirect to reset password page",
                redirect: true
            });
        }


        const token = jwt.sign(
            { id: provider._id, role: "provider" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );


        provider.resetPasswordToken = token;
        provider.resetPasswordExpires = Date.now() + 3600000;
        await provider.save();


        res.json({
            success: true,
            message: "Redirect to reset password page",
            redirect: true,
            resetToken: token
        });

    } catch (err) {
        console.error("Forgot password error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Token and new password are required" });
        }


        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        const provider = await Provider.findById(decoded.id);
        if (!provider) {
            return res.status(404).json({ success: false, message: "Provider not found" });
        }

        if (
            !provider.resetPasswordToken ||
            provider.resetPasswordToken !== token ||
            provider.resetPasswordExpires < Date.now()
        ) {
            return res.status(400).json({ success: false, message: "Token expired or invalid" });
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);
        provider.password = hashedPassword;


        provider.resetPasswordToken = undefined;
        provider.resetPasswordExpires = undefined;

        await provider.save();

        res.json({ success: true, message: "Password reset successfully" });

    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



export const getProviderRatings = async (req, res) => {
    try {
        const providerId = req.params.id;

        const bookings = await Booking.find({
            "ratings.providerId": providerId
        })
            .populate("customer", "name")
            .populate("serviceId", "name");

        let ratings = [];

        bookings.forEach(b => {
            b.ratings.forEach(r => {
                if (r.providerId.toString() === providerId) {
                    ratings.push({
                        rating: r.rating,
                        review: r.review,
                        userName: b.customer?.name || "User",
                        service: b.serviceId?.name || "N/A",
                        date: b.createdAt
                    });
                }
            });
        });

        const avgRating =
            ratings.length > 0
                ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                : 0;

        res.json({
            success: true,
            ratings,
            averageRating: avgRating.toFixed(1)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};