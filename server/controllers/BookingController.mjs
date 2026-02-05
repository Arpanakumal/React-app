import Booking from "../models/BookingModel.mjs";
import Service from "../models/ServiceModel.mjs";
import Provider from "../models/ProviderModel.mjs";
import User from "../models/UserModel.mjs";

export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            serviceId,
            providerId,
            appointmentDate,
            appointmentTime,
            address,
            notes,
            providerCount,
            username
        } = req.body;

        if (!serviceId || !providerId || !appointmentDate || !appointmentTime || !username) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking details"
            });
        }

        const user = await User.findById(userId);
        const service = await Service.findById(serviceId);
        const provider = await Provider.findById(providerId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });
        if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });
        if (!provider.available) {
            return res.status(400).json({ success: false, message: "Provider not available" });
        }

        const pricePerHour = Number(service.price_info);
        if (isNaN(pricePerHour)) {
            return res.status(400).json({ success: false, message: "Invalid service price" });
        }

        const commissionPercent = Number(provider.defaultCommissionPercent) || 10;

        const booking = await Booking.create({
            userId,
            username: username.trim(),
            providerId,
            serviceId,
            providerCount: providerCount || 1,

            customer: {
                name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
                email: user.email,
                phone: user.phone
            },

            address,
            appointmentDate,
            appointmentTime,
            notes,

            pricePerHour,
            commissionPercent
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        console.error("Booking creation error:", error.message, error.stack);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const listBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("serviceId", "name image category price_info")
            .populate("providerId", "name image")
            .populate("userId", "firstName lastName email phone");


        const formattedBookings = bookings.map(b => ({
            _id: b._id,
            username: b.username,
            provider: b.providerId ? { id: b.providerId._id, name: b.providerId.name, image: b.providerId.image } : null,
            service: b.serviceId ? { id: b.serviceId._id, name: b.serviceId.name, image: b.serviceId.image, category: b.serviceId.category, price: b.serviceId.price_info } : null,
            customer: b.customer,
            address: b.address,
            appointmentDate: b.appointmentDate,
            appointmentTime: b.appointmentTime,
            notes: b.notes,
            pricePerHour: b.pricePerHour,
            commissionPercent: b.commissionPercent,
            status: b.status,
            createdAt: b.createdAt,
        }));

        res.json({ success: true, data: formattedBookings });
    } catch (err) {
        console.error("Error fetching bookings:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("serviceId", "name category image price_info commissionPercent") // use correct field name
            .populate("providerId", "name")
            .populate("userId", "firstName lastName email phone");

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }


        const formattedBooking = {
            _id: booking._id,
            username: booking.username,
            provider: booking.providerId ? { id: booking.providerId._id, name: booking.providerId.name } : null,
            service: booking.serviceId
                ? {
                    id: booking.serviceId._id,
                    name: booking.serviceId.name,
                    category: booking.serviceId.category,
                    image: booking.serviceId.image,
                    price: booking.serviceId.price_info,
                    commissionPercent: booking.serviceId.commissionPercent
                }
                : null,
            customer: booking.customer,
            address: booking.address,
            appointmentDate: booking.appointmentDate,
            appointmentTime: booking.appointmentTime,
            notes: booking.notes,
            pricePerHour: booking.pricePerHour,
            commissionPercent: booking.commissionPercent,
            status: booking.status,
            createdAt: booking.createdAt,
        };

        res.json({ success: true, data: formattedBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        res.json({ success: true, data: booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};
