import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: "User",
            required: true
        },

        providerId: {
            type: String,
            ref: "Provider",
            required: true
        },

        serviceId: {
            type: String,
            ref: "Service",
            required: true
        },

        appointmentDate: {
            type: Date,
            required: true
        },

        address: {
            street: String,
            city: String,
            state: String,
            zip: String,
            country: String
        },

        price: {
            type: Number,
            required: true
        },

        commissionPercent: {
            type: Number,
            required: true
        },

        commissionAmount: {
            type: Number,
            required: true
        },

        providerEarning: {
            type: Number,
            required: true
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending"
        },

        bookingStatus: {
            type: String,
            enum: ["booked", "completed", "cancelled"],
            default: "booked"
        }
    },
    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
