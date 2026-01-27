import jwt from "jsonwebtoken";

const authRole = (requiredRole) => {
    return (req, res, next) => {
        try {
            const { atoken } = req.headers;
            if (!atoken) {
                return res.status(401).json({ success: false, message: "Not authorized. Login again." });
            }

            const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

            // Check if role matches
            if (requiredRole && token_decode.role !== requiredRole) {
                return res.status(403).json({ success: false, message: "Not authorized." });
            }

            // Save decoded token info to request
            req.user = token_decode;

            next();
        } catch (error) {
            console.log(error);
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
    };
};

export default authRole;
