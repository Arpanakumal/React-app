
import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";
import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";

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

        if (!name || !email || !password || !servicesOffered || !imageFile) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        // --- Hash password ---
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // --- Upload image to Cloudinary ---
        let imageUrl;
        if (imageFile) {
            const uploaded = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            imageUrl = uploaded.secure_url;
        }

        let servicesIds = [];
        if (servicesOffered) {
            let parsed = [];
            try {
                parsed = JSON.parse(servicesOffered); 
            } catch {
                parsed = Array.isArray(servicesOffered) ? servicesOffered : [servicesOffered];
            }
            servicesIds = parsed.map(id => mongoose.Types.ObjectId(id));
        }


        const provider = new Provider({
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            servicesOffered: servicesIds,
            experience,
            about,
            address: address ? JSON.parse(address) : {},
        });

        await provider.save();

        res.json({ success: true, data: provider });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};
