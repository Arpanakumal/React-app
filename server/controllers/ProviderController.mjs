import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import crypto from 'crypto';




// CREATE JWT TOKEN 
const createToken = (id) => {
    return jwt.sign({ id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const addProvider = async (req, res) => {
    try {
        const { name, email, servicesOffered, defaultCommissionPercent } = req.body; // fixed typo
        const imageFile = req.file;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required",
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
            name,
            email,
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


// List providers with summary info for admin panel
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
};



//update
export const updateProvider = async (req, res) => {
    const { id } = req.params;
    const { name, email, servicesOffered, password } = req.body;

    const provider = await Provider.findById(id);
    if (!provider) {
        return res.status(404).json({ success: false, message: "Provider not found" });
    }

    if (name) provider.name = name;

    if (email && email !== provider.email) {
        const exists = await Provider.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "Email in use" });
        }
        provider.email = email;
    }

    if (password) {
        provider.password = await bcrypt.hash(password, 10);
    }

    if (servicesOffered) {
        provider.servicesOffered = JSON.parse(servicesOffered).map(
            (id) => new mongoose.Types.ObjectId(id)
        );
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


