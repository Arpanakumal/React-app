import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    servicesOffered: [{ type: String }],
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Provider", providerSchema);
