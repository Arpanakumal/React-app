import userModel from "../models/UserModel.mjs";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";


const createToken = (id) => {
    return jwt.sign(
        { id, role: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            name: name.trim(),
            email: email.trim(),
            password: hashedPassword,
            isActive: true
        });

        const token = createToken(user._id);

        res.status(201).json({
            success: true,
            token,
            id: user._id,
            name: user.name
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: "Account is deactivated" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            role: "customer",
            id: user._id,
            name: user.name
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, "-password");
        res.json({ success: true, data: users });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const toggleUserStatus = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        user.isActive = !user.isActive;
        await user.save();

        res.json({
            success: true,
            message: `User ${user.isActive ? "activated" : "deactivated"}`,
            isActive: user.isActive
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id, "-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        if (req.user?.role === "admin") {
            return res.json({
                success: true,
                data: { name: "Admin", email: null, id: "admin" }
            });
        }

        const user = await userModel.findById(req.user.id, "-password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await userModel.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (name) user.name = name.trim();

        if (email && email !== user.email) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({ success: false, message: "Invalid email" });
            }

            const exists = await userModel.findOne({
                email,
                _id: { $ne: user._id }
            });

            if (exists) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }

            user.email = email.trim();
        }

        if (password) {
            if (password.length < 8) {
                return res.status(400).json({ success: false, message: "Password too short" });
            }

            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        res.json({
            success: true,
            message: "User updated",
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, message: "User deleted" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Valid email required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: true,
                message: "If account exists, reset link sent",
                redirect: true
            });
        }

        const token = jwt.sign(
            { id: user._id, role: "customer" },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000;

        await user.save();

        res.json({
            success: true,
            resetToken: token,
            redirect: true
        });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ success: false, message: "Missing data" });
        }

        let decoded;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid token" });
        }

        const user = await userModel.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (
            user.resetPasswordToken !== token ||
            user.resetPasswordExpires < Date.now()
        ) {
            return res.status(400).json({ success: false, message: "Token expired" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.json({ success: true, message: "Password reset successful" });

    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};