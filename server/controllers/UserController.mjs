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
        // check if user exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        // validate email
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validate password
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
            password: hashedPassword
        });

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// LOGIN USER
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);

        res.json({ success: true, token });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
