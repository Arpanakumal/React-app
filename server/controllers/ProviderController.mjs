import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import Booking from "../models/BookingModel.mjs";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import validator from "validator";
import crypto from 'crypto';
import { calculateProviderEarnings } from "../utils/BookingHelpers.mjs";



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
            { id: provider._id, role: "provider" },
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
            .select("name image servicesOffered available")
            .populate("servicesOffered", "name");

        res.json({ success: true, data: providers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}




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


        let mySlot = booking.providerCommissions.find(pc => pc.providerId?.toString() === providerId);

        if (action === "accept") {
            if (mySlot?.accepted) {
                return res.status(400).json({ success: false, message: "You already accepted this booking" });
            }

            if (!mySlot) {

                mySlot = booking.providerCommissions.find(pc => !pc.accepted && !pc.rejected);
                if (!mySlot) {
                    return res.status(400).json({ success: false, message: "No available slots for acceptance" });
                }

                mySlot.providerId = providerId;
            }

            mySlot.accepted = true;
            mySlot.rejected = false;

        } else if (action === "reject") {
            if (!mySlot || !mySlot.accepted) {

                mySlot = booking.providerCommissions.find(pc => pc.providerId?.toString() === providerId) || booking.providerCommissions.find(pc => !pc.accepted && !pc.rejected);
                if (!mySlot) {

                    return res.status(400).json({ success: false, message: "No booking slot to reject" });
                }
            }

            mySlot.accepted = false;
            mySlot.rejected = true;
            mySlot.providerId = providerId;
        }


        booking.providerIds = booking.providerCommissions
            .filter(pc => pc.accepted)
            .map(pc => pc.providerId);


        if (booking.finalPrice) {
            const result = calculateProviderEarnings(booking);
            booking.providerCommissions = result.booking.providerCommissions;
            booking.finalPrice = result.finalPrice;
            booking.commissionAmount = result.commissionAmount;
            booking.providerEarning = result.providerEarning;
        }

        const totalRequired = booking.providerCommissions.length;
        const totalAccepted = booking.providerCommissions.filter(pc => pc.accepted).length;
        const remainingProviders = totalRequired - totalAccepted;
        const allAccepted = remainingProviders === 0;

        booking.status = allAccepted ? "accepted" : "pending";

        await booking.save();

        res.json({
            success: true,
            message: action === "accept"
                ? (allAccepted
                    ? "All providers accepted. Ready to start."
                    : `${remainingProviders} more provider(s) needed`)
                : "You rejected the booking",
            data: {
                remainingProviders,
                allAccepted,
                providerIds: booking.providerIds,
                providerCommissions: booking.providerCommissions.map(pc => ({
                    providerId: pc.providerId,
                    accepted: pc.accepted,
                    rejected: pc.rejected,
                    earning: pc.earning
                })),
                status: booking.status
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



export const startBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });


        const isAssigned = booking.providerCommissions.some(pc => pc.providerId?.toString() === providerId && pc.accepted);
        if (!isAssigned) return res.status(403).json({ success: false, message: "Not assigned to this booking" });

        if (booking.status !== "accepted") return res.status(400).json({ success: false, message: "Booking must be accepted first" });

        booking.startedAt = new Date();
        booking.status = "in-progress";

        await booking.save();

        res.json({ success: true, message: "Booking started", data: booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const endBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const isAssigned = booking.providerCommissions.some(pc => pc.providerId?.toString() === providerId && pc.accepted);
        if (!isAssigned) return res.status(403).json({ success: false, message: "Not authorized for this booking" });

        if (booking.status !== "in-progress") return res.status(400).json({ success: false, message: "Booking not in progress" });

        booking.endedAt = new Date();
        const hoursWorked = (booking.endedAt - booking.startedAt) / 3600000;

        const result = calculateProviderEarnings(booking, hoursWorked);
        booking.providerCommissions = result.booking.providerCommissions;
        booking.finalPrice = result.finalPrice;
        booking.commissionAmount = result.commissionAmount;
        booking.providerEarning = result.providerEarning;
        booking.commissionPaid = false;
        booking.status = "completed";
        booking.hoursWorked = hoursWorked;

        await booking.save();

        res.json({ success: true, message: "Booking completed", data: booking });

    } catch (err) {
        console.error(err);
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
            {
                $unwind: "$providerCommissions"
            },
            {
                $match: {
                    "providerCommissions.providerId": new mongoose.Types.ObjectId(providerId),
                    "providerCommissions.accepted": true
                }
            },
            {
                $project: {
                    commissionShare: "$providerCommissions.commissionShare"
                }
            },
            {
                $group: {
                    _id: null,
                    totalPending: { $sum: "$commissionShare" }
                }
            }
        ]);

        const pendingCommission = pendingCommissionsAgg[0]?.totalPending || 0;

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
                finalPrice: booking.finalPrice,
                commissionPercent: booking.commissionPercent,
                commissionAmount: mySlot.commissionShare || 0,
                providerEarning: mySlot.earningShare || 0,
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
        provider.availability.isAvailable =
            typeof isAvailable === "boolean"
                ? isAvailable
                : provider.availability.isAvailable ?? true;

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