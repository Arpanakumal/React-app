import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    image: { type: String },

    servicesOffered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],

    experience: { type: String },
    about: { type: String },

    available: { type: Boolean, default: true },

    address: {
        street: { type: String },
        city: { type: String },
        state: { type: String },
        zipcode: { type: String },
    },

    rating: { type: Number, default: 0 },
    dateJoined: { type: Date, default: Date.now },

    slots_booked: { type: Object, default: {} },
}, { minimize: false });

const Provider = mongoose.models.Provider || mongoose.model("Provider", providerSchema);

export default Provider;
