import Provider from "../models/ProviderModel.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";




// CREATE JWT TOKEN 
const createToken = (id) => {
    return jwt.sign({ id, role: "provider" }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// - ADD PROVIDER (SIGNUP) -
export const addProvider = async (req, res) => {
    try {
        const { name, email, password, servicesOffered, experience, about, address } = req.body;


        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const exists = await Provider.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: "Provider already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Build provider object
        const providerData = {
            name,
            email,
            password: hashedPassword,
            servicesOffered: servicesOffered ? JSON.parse(servicesOffered) : [],
            experience,
            about,
            address: address ? JSON.parse(address) : {},
        };

        // Add image if uploaded
        if (req.file) {
            providerData.image = req.file.filename;
        }

        const provider = new Provider(providerData);
        await provider.save();

        res.status(201).json({ success: true, data: provider });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

