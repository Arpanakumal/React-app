import userModel from "../models/UserModel.mjs";
import jwt from "jsonwebtoken";

const authmiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.id).select("name role");

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            id: user._id,
            name: user.name,
            role: user.role || "customer"
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default authmiddleware;