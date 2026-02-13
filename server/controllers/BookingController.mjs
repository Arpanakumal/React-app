import Booking from "../models/BookingModel.mjs";
import Service from "../models/ServiceModel.mjs";
import Provider from "../models/ProviderModel.mjs";
import User from "../models/UserModel.mjs";



// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            serviceId,
            appointmentDate,
            appointmentTime,
            address,
            notes,
            providerCount,
            username
        } = req.body;


        if (!serviceId || !appointmentDate || !appointmentTime || !username) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking details"
            });
        }

        const user = await User.findById(userId);
        const service = await Service.findById(serviceId);

        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });

        const pricePerHour = Number(service.price_info);
        if (isNaN(pricePerHour)) return res.status(400).json({ success: false, message: "Invalid service price" });

        const providerCountNumber = Number(providerCount) || 1;
        const commissionPercent = Number(service.commissionPercent) || 10;

        const finalPrice = pricePerHour * providerCountNumber;
        const commissionAmount = (finalPrice * commissionPercent) / 100;
        const providerEarning = finalPrice - commissionAmount;


        const booking = await Booking.create({
            userId,
            username: username.trim(),
            providerId: null,
            serviceId,
            providerCount: providerCountNumber,
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
            commissionPercent,
            finalPrice,
            commissionAmount,
            providerEarning
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully. Provider will accept it soon.",
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
            .sort({ createdAt: -1 })
            .populate("serviceId", "name image category price_info commissionPercent")
            .populate("providerId", "name image")
            .populate("userId", "firstName lastName email phone");

        if (!bookings.length) {
            return res.json({ success: true, data: [], message: "No bookings found" });
        }

        const formattedBookings = bookings.map(b => {
            const totalPrice = b.pricePerHour * (b.providerCount || 1);
            const commissionAmount = (totalPrice * (b.commissionPercent || 10)) / 100;
            const providerEarning = totalPrice - commissionAmount;

            return {
                _id: b._id,
                username: b.username,
                providerCount: b.providerCount || 1,
                customer: b.customer || {},
                address: b.address || {},
                appointmentDate: b.appointmentDate,
                appointmentTime: b.appointmentTime,
                notes: b.notes,
                pricePerHour: b.pricePerHour,
                commissionPercent: b.commissionPercent,
                status: b.status,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
                provider: b.providerId ? { id: b.providerId._id, name: b.providerId.name, image: b.providerId.image } : null,
                service: b.serviceId ? {
                    id: b.serviceId._id,
                    name: b.serviceId.name,
                    category: b.serviceId.category,
                    image: b.serviceId.image,
                    price: b.serviceId.price_info,
                    commissionPercent: b.serviceId.commissionPercent
                } : null,
                totalPrice,
                commissionAmount,
                providerEarning,
            };
        });

        res.json({ success: true, data: formattedBookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// bookings for provider dashboard
export const listBookingsForProvider = async (req, res) => {
    try {
        const providerId = req.user.id;
        const provider = await Provider.findById(providerId)
            .populate({ path: "servicesOffered", select: "_id", strictPopulate: false });

        if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

        const bookings = await Booking.find({
            serviceId: { $in: provider.servicesOffered.map(s => s._id) },
            status: "pending",
        })
            .sort({ createdAt: -1 })
            .populate("serviceId", "name image category price_info")
            .populate("userId", "firstName lastName email phone");

        res.json({ success: true, data: bookings });
    } catch (err) {
        console.error("Error fetching provider bookings:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};


// Get booking by ID
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("serviceId", "name category image price_info commissionPercent")
            .populate("providerId", "name image")
            .populate("userId", "firstName lastName email phone");

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const totalPrice = booking.pricePerHour * (booking.providerCount || 1);
        const commissionAmount = (totalPrice * (booking.commissionPercent || 10)) / 100;
        const providerEarning = totalPrice - commissionAmount;

        const formattedBooking = {
            _id: booking._id,
            username: booking.username,
            provider: booking.providerId ? { id: booking.providerId._id, name: booking.providerId.name, image: booking.providerId.image } : null,
            service: booking.serviceId ? {
                id: booking.serviceId._id,
                name: booking.serviceId.name,
                category: booking.serviceId.category,
                image: booking.serviceId.image,
                price: booking.serviceId.price_info,
                commissionPercent: booking.serviceId.commissionPercent
            } : null,
            customer: booking.customer,
            address: booking.address,
            appointmentDate: booking.appointmentDate,
            appointmentTime: booking.appointmentTime,
            notes: booking.notes,
            pricePerHour: booking.pricePerHour,
            providerCount: booking.providerCount || 1,
            commissionPercent: booking.commissionPercent,
            status: booking.status,
            createdAt: booking.createdAt,
            finalPrice: booking.finalPrice,
            commissionAmount,
            providerEarning
        };

        res.json({ success: true, data: formattedBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const completeBooking = async (req, res) => {
    try {
        const { hoursWorked } = req.body;
        if (isNaN(hoursWorked) || hoursWorked <= 0) {
            return res.status(400).json({ success: false, message: "Invalid hours worked" });
        }

        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const newFinalPrice = booking.pricePerHour * hoursWorked * (booking.providerCount || 1);
        const newCommissionAmount = (newFinalPrice * (booking.commissionPercent || 10)) / 100;
        const newProviderEarning = newFinalPrice - newCommissionAmount;

        booking.finalPrice = newFinalPrice;
        booking.commissionAmount = newCommissionAmount;
        booking.providerEarning = newProviderEarning;
        booking.status = "completed";

        await booking.save();

        res.json({ success: true, message: "Booking completed", data: booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};



export const updateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["pending", "in-progress", "completed", "cancelled"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        res.json({ success: true, message: "Status updated", data: booking });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

