import mongoose from "mongoose";
import Provider from "../models/ProviderModel.mjs";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.mjs";




export const loginAll = async (req, res) => {
    const { email, password } = req.body;

    try {

        if (email.toLowerCase().trim() === process.env.ADMIN_EMAIL.toLowerCase().trim() &&
            password.trim() === process.env.ADMIN_PASSWORD.trim()) {
            const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token, role: "admin", name: "Admin", id: "admin" });
        }

        const provider = await Provider.findOne({ email });
        if (provider && await bcrypt.compare(password, provider.password)) {
            const token = jwt.sign({ role: "provider", id: provider._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token, role: "provider", name: provider.name, id: provider._id });
        }


        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ role: "user", id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token, role: "user", name: user.name, id: user._id });
        }

        return res.json({ success: false, message: "Invalid credentials" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

