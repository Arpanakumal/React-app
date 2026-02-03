import Booking from "../models/BookingModel.mjs";
import Service from "../models/ServiceModel.mjs";
import Provider from "../models/ProviderModel.mjs";


export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            providerId,
            serviceId,
            appointmentDate,
            appointmentTime,
            address,
            notes
        } = req.body;

        if (!providerId || !serviceId || !appointmentDate || !appointmentTime || !address) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking details"
            });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }

        const provider = await Provider.findById(providerId);
        if (!provider || !provider.available) {
            return res.status(404).json({ success: false, message: "Provider not available" });
        }

        const servicePrice = service.price;
        const commissionPercent = provider.defaultCommissionPercent || 10;
        const commissionAmount = (servicePrice * commissionPercent) / 100;
        const providerEarning = servicePrice - commissionAmount;

        const booking = await Booking.create({
            user: userId,
            provider: providerId,
            service: serviceId,

            appointmentDate,
            appointmentTime,
            address,
            notes,

            servicePrice,
            commissionPercent,
            commissionAmount,
            providerEarning,

            status: "pending",
            commissionStatus: "unpaid"
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error creating booking"
        });
    }
};



