import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        customerName: {
            type: String,
            required: true
        },
        serviceName: {
            type: String,
            required: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        serviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Service"
        },
        status: {
            type: String, enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
            default: "Pending"
        },
        date: {
            type: Date,
            default: Date.now
        }
    });

export default mongoose.model("Booking", bookingSchema);
