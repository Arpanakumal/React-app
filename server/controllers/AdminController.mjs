import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.mjs";


export const addProvider = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            servicesOffered,
            experience,
            about,
            address,
        } = req.body;

        const imageFile = req.file;

        // ---- validation ----
        if (!name || !email || !password || !servicesOffered || !imageFile) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
            });
        }

        // ---- hash password ----
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // ---- image path ----
        const imageUrl = `/uploads/${imageFile.filename}`;

        // ---- parse servicesOffered ----
        let servicesIds = [];
        try {
            const parsed = JSON.parse(servicesOffered);
            servicesIds = parsed.map(id => new mongoose.Types.ObjectId(id));
        } catch {
            return res.status(400).json({
                success: false,
                message: "servicesOffered must be a valid JSON array of IDs",
            });
        }

        // ---- parse address ----
        let parsedAddress = {};
        if (address) {
            try {
                parsedAddress = JSON.parse(address);
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Address must be valid JSON",
                });
            }
        }

        // ---- create provider ----
        const provider = new Provider({
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            servicesOffered: servicesIds,
            experience,
            about,
            address: parsedAddress,
        });

        await provider.save();

        res.status(201).json({
            success: true,
            data: provider,
        });
    } catch (err) {
        console.error(err);

        // Handle duplicate email gracefully
        if (err.code === 11000 && err.keyPattern?.email) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};

export const loginAll = async (req, res) => {
    const { email, password } = req.body;

    try {
        // --- Check admin ---
        if (email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim() &&
            password.trim() === process.env.ADMIN_PASSWORD.trim()) {
            const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token, role: "admin", name: "Admin", id: "admin" });
        }

        // --- Check provider ---
        const provider = await Provider.findOne({ email });
        if (provider && await bcrypt.compare(password, provider.password)) {
            const token = jwt.sign({ role: "provider", id: provider._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token, role: "provider", name: provider.name, id: provider._id });
        }

        // --- Check user ---
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ role: "user", id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token, role: "user", name: user.name, id: user._id });
        }

        // --- Invalid credentials ---
        return res.json({ success: false, message: "Invalid credentials" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};