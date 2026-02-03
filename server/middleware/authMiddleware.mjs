import jwt from "jsonwebtoken";

const authmiddleware = (req, res, next) => {
    try {
        const token = req.headers.atoken; 
        if (!token) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export default authmiddleware;
