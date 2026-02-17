import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        username: { type: String, required: true },
        providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
        serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },

        providerCount: { type: Number, default: 1 },

        customer: {
            name: String,
            email: String,
            phone: String
        },

        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String
        },

        appointmentDate: { type: Date, required: true },
        appointmentTime: { type: String, required: true },
        notes: String,

        pricePerHour: { type: Number, required: true },
        startedAt: { type: Date },
        endedAt: { type: Date },

        finalPrice: { type: Number, default: 0 },
        commissionPercent: { type: Number, default: 10 },
        commissionAmount: { type: Number, default: 0 },
        providerEarning: { type: Number, default: 0 },

        status: {
            type: String,
            enum: ["pending", "accepted", "in-progress", "completed", "cancelled"],
            default: "pending"
        },
    },
    { timestamps: true }
);

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;
