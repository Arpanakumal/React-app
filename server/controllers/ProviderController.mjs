import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import validator from "validator";
import crypto from 'crypto';




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


// start 
export const startBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking)
            return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.providerId.toString() !== providerId) {
            return res.status(403).json({ success: false, message: "Not authorized for this booking" });
        }

        if (booking.status !== "pending") {
            return res.status(400).json({ success: false, message: "Booking already started or completed" });
        }

        booking.startedAt = new Date();
        booking.status = "in-progress";
        await booking.save();

        res.json({ success: true, message: "Booking started", data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// end/completed
export const endBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking)
            return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.providerId.toString() !== providerId) {
            return res.status(403).json({ success: false, message: "Not authorized for this booking" });
        }

        if (booking.status !== "in-progress") {
            return res.status(400).json({ success: false, message: "Booking not in progress" });
        }

        booking.endedAt = new Date();

        // Calculate hours worked
        const hoursWorked = (booking.endedAt - booking.startedAt) / 3600000;
        const finalPrice = hoursWorked * booking.pricePerHour;

        booking.finalPrice = finalPrice;
        booking.commissionAmount = (finalPrice * booking.commissionPercent) / 100;
        booking.providerEarning = finalPrice - booking.commissionAmount;
        booking.status = "completed";

        await booking.save();

        res.json({ success: true, message: "Booking completed", data: booking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};