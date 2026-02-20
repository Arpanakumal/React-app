import mongoose from "mongoose";

const providerCommissionSchema = new mongoose.Schema({
    providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", default: null },
    accepted: { type: Boolean, default: false },
    rejected: { type: Boolean, default: false }, 
    earning: { type: Number, default: 0 },     
    commissionPaid: { type: Boolean, default: false }
});

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: String,
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    providerCount: { type: Number, default: 1 },
    providerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Provider" }], 
    providerCommissions: [providerCommissionSchema],
    customer: Object,
    phone: String,
    address: Object,
    appointmentDate: Date,
    appointmentTime: String,
    notes: String,
    pricePerHour: Number,
    commissionPercent: Number,
    finalPrice: Number,
    commissionAmount: Number,
    providerEarning: Number,
    commissionPaid: { type: Boolean, default: false },
    status: { type: String, default: "pending" },
    startedAt: Date,
    endedAt: Date,
}, { timestamps: true });


const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;