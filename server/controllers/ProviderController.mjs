import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";




// CREATE JWT TOKEN 
const createToken = (id) => {
    return jwt.sign({ id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

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

        // validation
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

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //image path
        const imageUrl = `/uploads/${imageFile.filename}`;


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

        //add provider
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

        // Handle duplicate email
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


//listprovider
export const listProviders = async (req, res) => {
    try {
        const providers = await Provider.find()
            .select("-password")
            .populate("servicesOffered");

        res.json({
            success: true,
            data: providers
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error fetching providers"
        });
    }
};


//update
export const updateProvider = async (req, res) => {
    try {
        const { id } = req.params;

        const provider = await Provider.findById(id);
        if (!provider) {
            return res.status(404).json({
                success: false,
                message: "Provider not found"
            });
        }

        const {
            name,
            email,
            servicesOffered,
            experience,
            about,
            address,
            available
        } = req.body;

        if (name) provider.name = name;
        if (email && email !== provider.email) {
            const exists = await Provider.findOne({ email });
            if (exists) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }
            provider.email = email;
        }

        if (experience) provider.experience = experience;
        if (about) provider.about = about;
        if (available !== undefined) provider.available = available;
        let servicesIds = [];

        try {
            let parsed = [];

            if (typeof servicesOffered === "string") {

                parsed = JSON.parse(servicesOffered);
            } else if (Array.isArray(servicesOffered)) {

                parsed = servicesOffered;
            } else {
                throw new Error("Invalid type for servicesOffered");
            }

            servicesIds = parsed.map(id => new mongoose.Types.ObjectId(id));
        } catch {
            return res.status(400).json({
                success: false,
                message: "servicesOffered must be a valid JSON array of IDs",
            });
        }

        if (address) {
            try {
                provider.address = JSON.parse(address);
            } catch {
                return res.status(400).json({ success: false, message: "Invalid JSON for address" });
            }
        }


        if (req.file) {
            provider.image = `/uploads/${req.file.filename}`;
        }

        await provider.save();

        res.json({
            success: true,
            message: "Provider updated successfully",
            data: provider
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error updating provider"
        });
    }
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


