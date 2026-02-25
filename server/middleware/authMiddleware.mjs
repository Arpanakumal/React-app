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

        req.user = {
            id: decoded.id,
            role: decoded.role || "user", 
        };


        if (req.requiredRole && req.user.role !== req.requiredRole) {
            return res.status(403).json({
                success: false,
                message: "Access denied: insufficient permissions",
            });
        }

        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};

export default authmiddleware;