import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price_info: { type: Number, required: true },
    category: String,
    image: String,
    commissionPercent: { type: Number, default: null },
}, { timestamps: true });

const ServiceModel = mongoose.models.Service || mongoose.model("Service", serviceSchema);
export default ServiceModel;
