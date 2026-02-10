import mongoose from "mongoose";


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

