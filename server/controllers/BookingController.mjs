import Booking from "../models/BookingModel.mjs";
import Service from "../models/ServiceModel.mjs";
import Provider from "../models/ProviderModel.mjs";
import validator from "validator";
import User from "../models/UserModel.mjs";



// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { serviceId, appointmentDate, appointmentTime, address, notes, providerCount, username, phone } = req.body;

        if (!serviceId || !appointmentDate || !appointmentTime || !username || !phone) {
            return res.status(400).json({ success: false, message: "Missing required booking details" });
        }

        const service = await Service.findById(serviceId);
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });

        const pricePerHour = Number(service.price_info);
        const providerCountNumber = Number(providerCount) || 1;
        const commissionPercent = Number(service.commissionPercent) || 10;

        const finalPrice = pricePerHour * providerCountNumber;
        const commissionAmount = (finalPrice * commissionPercent) / 100;
        const providerEarning = finalPrice - commissionAmount;

        // initialize providerCommissions array
        const providerCommissions = Array.from({ length: providerCountNumber }, () => ({
            providerId: null,
            accepted: false,
            commissionShare: commissionAmount / providerCountNumber,
            commissionPaid: false
        }));

        const booking = await Booking.create({
            userId,
            username: username.trim(),
            serviceId,
            providerCount: providerCountNumber,
            providerIds: [],
            providerCommissions,
            customer: { name: username.trim(), phone },
            phone,
            address,
            appointmentDate,
            appointmentTime,
            notes,
            pricePerHour,
            commissionPercent,
            finalPrice,
            commissionAmount,
            providerEarning,
        });

        res.status(201).json({ success: true, message: "Booking created", data: booking });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};



export const listBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 })
            .populate("serviceId", "name image category price_info commissionPercent")
            .populate("providerIds", "name image")
            .populate("userId", "firstName lastName email");

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
                phone: b.phone || (b.customer?.phone || ""),
                address: b.address || {},
                appointmentDate: b.appointmentDate,
                appointmentTime: b.appointmentTime,
                notes: b.notes,
                pricePerHour: b.pricePerHour,
                commissionPercent: b.commissionPercent,
                status: b.status,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
                providers: b.providerIds?.map(p => ({
                    id: p._id,
                    name: p.name,
                    image: p.image
                })) || [],

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




export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("serviceId", "name category image price_info commissionPercent")
            .populate("providerIds", "name image")
            .populate("userId", "firstName lastName email");

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const totalPrice = booking.pricePerHour * (booking.providerCount || 1);
        const commissionAmount = (totalPrice * (booking.commissionPercent || 10)) / 100;
        const providerEarning = totalPrice - commissionAmount;

        const formattedBooking = {
            _id: booking._id,
            username: booking.username,
            providers: booking.providerIds?.map(p => ({
                id: p._id,
                name: p.name,
                image: p.image
            })) || [],

            service: booking.serviceId ? {
                id: booking.serviceId._id,
                name: booking.serviceId.name,
                category: booking.serviceId.category,
                image: booking.serviceId.image,
                price: booking.serviceId.price_info,
                commissionPercent: booking.serviceId.commissionPercent
            } : null,
            customer: booking.customer,
            phone: booking.phone || (booking.customer?.phone || ""),
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



export const acceptBooking = async (req, res) => {
    try {
        const providerId = req.user.id;
        const { bookingId } = req.body;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });


        const alreadyAccepted = booking.providerCommissions.some(
            pc => pc.providerId?.toString() === providerId
        );
        if (alreadyAccepted) {
            return res.status(400).json({ success: false, message: "You already accepted this booking" });
        }

        const emptySlot = booking.providerCommissions.find(pc => !pc.accepted);
        if (!emptySlot) return res.status(400).json({ success: false, message: "No available slot" });

        emptySlot.providerId = providerId;
        emptySlot.accepted = true;

        // Update providerIds array
        booking.providerIds = booking.providerCommissions
            .filter(pc => pc.accepted && pc.providerId)
            .map(pc => pc.providerId);

        // Only mark status as accepted if ALL providers have accepted
        const allAccepted = booking.providerCommissions.every(pc => pc.accepted);
        booking.status = allAccepted ? "accepted" : "pending";

        await booking.save();


        res.json({ success: true, message: "Booking accepted", data: booking });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const listBookingsForProvider = async (req, res) => {
    try {
        const providerId = req.user.id;

        const provider = await Provider.findById(providerId).select("servicesOffered");
        if (!provider) return res.status(404).json({ success: false, message: "Provider not found" });

        const bookings = await Booking.find({
            serviceId: { $in: provider.servicesOffered },
            "providerCommissions.accepted": false
        })
            .sort({ createdAt: -1 })
            .populate("serviceId", "name image category price_info commissionPercent")
            .populate("providerCommissions.providerId", "name image")
            .populate("userId", "firstName lastName email");

        const formatted = bookings.map(b => {
            const mySlot = b.providerCommissions.find(pc => pc.providerId?.toString() === providerId);
            const allAccepted = b.providerCommissions.every(pc => pc.accepted);

            return {
                _id: b._id,
                customer: b.customer,
                username: b.username,
                status: b.status,
                appointmentDate: b.appointmentDate,
                appointmentTime: b.appointmentTime,
                notes: b.notes,
                pricePerHour: b.pricePerHour,
                providerCount: b.providerCount,
                finalPrice: b.finalPrice,
                commissionAmount: b.commissionAmount,
                providerEarning: b.providerEarning,
                providers: b.providerCommissions.map(pc => ({
                    id: pc.providerId?._id,
                    name: pc.providerId?.name,
                    accepted: pc.accepted
                })),
                service: b.serviceId,
                canRespond: !mySlot || !mySlot.accepted,
                canStart: allAccepted && b.status === "accepted"
            };
        });

        res.json({ success: true, data: formatted });
    } catch (err) {
        console.error("listBookingsForProvider error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const completeBooking = async (req, res) => {
    try {
        const { hoursWorked } = req.body;
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        // Ensure provider is assigned
        const mySlot = booking.providerCommissions.find(pc => pc.providerId?.toString() === providerId);
        if (!mySlot || !mySlot.accepted) {
            return res.status(403).json({ success: false, message: "You are not assigned to this booking" });
        }

        if (isNaN(hoursWorked) || hoursWorked <= 0) {
            return res.status(400).json({ success: false, message: "Invalid hours worked" });
        }

        // calculate final price for all providers
        const finalPrice = booking.pricePerHour * hoursWorked * (booking.providerCount || 1);
        const totalCommission = (finalPrice * (booking.commissionPercent || 10)) / 100;
        const providerEarning = finalPrice - totalCommission;

        booking.finalPrice = finalPrice;
        booking.commissionAmount = totalCommission;
        booking.providerEarning = providerEarning;
        booking.status = "completed";
        booking.endedAt = new Date();

        // split commission among providers
        const perProviderCommission = totalCommission / booking.providerCommissions.length;

        booking.providerCommissions = booking.providerCommissions.map(pc => ({
            ...pc.toObject(),
            commissionShare: perProviderCommission,

            commissionPaid: pc.commissionPaid || false
        }));

        await booking.save();

        res.json({ success: true, message: "Booking completed", data: booking });

    } catch (err) {
        console.error(err);
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

