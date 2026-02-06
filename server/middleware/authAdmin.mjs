import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }

        req.admin = decoded;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export default authAdmin;
