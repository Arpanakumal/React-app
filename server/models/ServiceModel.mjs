import mongoose from "mongoose";

const ServiceSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        price_info: { type: Number, required: true }, 
        image: { type: String, required: true },
        category: { type: String, required: true },
        commissionPercent: { type: Number, default: 10, required: true } 
    },
    { timestamps: true }
);

const ServiceModel = mongoose.models.Service || mongoose.model("Service", ServiceSchema);

export default ServiceModel;
