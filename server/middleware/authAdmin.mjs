import jwt from "jsonwebtoken";

const authAdmin = (req, res, next) => {
    try {
        const { atoken } = req.headers;
        if (!atoken) {
            return res.status(401).json({ success: false, message: "Not authorized. Login again." });
        }

        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);

        if (token_decode.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }


        req.admin = token_decode; 

        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ success: false, message: "Invalid token" });
    }
};

export default authAdmin;
