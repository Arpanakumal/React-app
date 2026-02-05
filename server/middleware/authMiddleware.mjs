import jwt from "jsonwebtoken";

const authmiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization; 

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Login again."
            });
        }

        const token = authHeader.split(" ")[1]; 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        next();
    } catch (err) {
        console.error(err);
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
};

export default authmiddleware;
