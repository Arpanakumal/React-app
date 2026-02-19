import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },
    servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    defaultCommissionPercent: { type: Number, default: 10 },
    available: { type: Boolean, default: true },
    availability: {
    workingDays: [String],
    startTime: String,   
    endTime: String,  
    isAvailable: { type: Boolean, default: true } 
}

}, { timestamps: true });


const Provider = mongoose.models.Provider || mongoose.model("Provider", providerSchema);
export default Provider;
