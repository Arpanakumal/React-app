import userModel from "../models/UserModel.mjs";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

// create token
const createToken = (id) => {
    return jwt.sign(
        { id, role: "customer" },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// REGISTER USER
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }


        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }


        if (password.length < 8) {
            return res.json({
                success: false,
                message: "Password must be at least 8 characters"
            });
        }

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // create user
        const user = await userModel.create({
            name,
            email,
            password: hashedPassword,
            isActive: true
        });

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// List customers
export const listUsers = async (req, res) => {
    try {
        const users = await userModel.find({}, "-password"); 
        res.json({ success: true, data: users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Toggle user active/inactive
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        user.isActive = !user.isActive;
        await user.save();

        res.json({ success: true, isActive: user.isActive, message: `User ${user.isActive ? "activated" : "deactivated"}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
