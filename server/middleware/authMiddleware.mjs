import jwt from "jsonwebtoken";

const authmiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);


        if (!decoded?.id) {
            return res.status(401).json({ success: false, message: "Invalid token payload" });
        }

        req.user = decoded; 
        next();
    } catch (err) {
        console.error("Auth middleware error:", err);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export default authmiddleware;
