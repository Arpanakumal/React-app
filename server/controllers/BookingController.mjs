import mongoose from "mongoose";

import Booking from "../models/BookingModel.mjs";
import Service from "../models/ServiceModel.mjs";
import Provider from "../models/ProviderModel.mjs";
import validator from "validator";
import User from "../models/UserModel.mjs";
import { hasScheduleConflict } from "../utils/ScheduleCheck.mjs";



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
            username,
            phone
        } = req.body;

        if (!serviceId || !appointmentDate || !appointmentTime || !username || !phone) {
            return res.status(400).json({
                success: false,
                message: "Missing required booking details"
            });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }


        const start = new Date(`${appointmentDate}T${appointmentTime}`);
        const durationHours = 1;
        const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

        const pricePerHour = Number(service.price_info);
        const providerCountNumber = Number(providerCount) || 1;
        const commissionPercent = Number(service.commissionPercent) || 10;

        const finalPrice = pricePerHour * durationHours * providerCountNumber;
        const commissionAmount = (finalPrice * commissionPercent) / 100;
        const providerEarning = finalPrice - commissionAmount;

        const providerCommissions = Array.from({ length: providerCountNumber }, () => ({
            providerId: null,
            accepted: false,
            rejected: false,
            earning: 0,
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
            appointmentStart: start,
            appointmentEnd: end,
            notes,
            pricePerHour,
            commissionPercent,
            finalPrice,
            commissionAmount,
            providerEarning,
            status: "pending"
        });

        res.status(201).json({
            success: true,
            message: "Booking created",
            data: booking
        });

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

            const totalPrice = b.finalPrice || 0;
            const commissionAmount = b.commissionAmount || 0;
            const providerEarning = b.providerEarning || 0;


            return {
                _id: b._id,
                username: b.username,
                providerCount: b.providerCount || 1,
                customer: b.customer || {},
                phone: b.phone || (b.customer?.phone || ""),
                address: b.address || {},
                appointmentStart: b.appointmentStart,
                appointmentEnd: b.appointmentEnd,
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

        const commissionAmount = booking.commissionAmount || 0;
        const providerEarning = booking.providerEarning || 0;

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
            appointmentStart: booking.appointmentStart,
            appointmentEnd: booking.appointmentEnd,
            notes: booking.notes,
            pricePerHour: booking.pricePerHour,
            providerCount: booking.providerCount || 1,
            commissionPercent: booking.commissionPercent,
            status: booking.status,
            createdAt: booking.createdAt,
            finalPrice: booking.finalPrice,
            commissionAmount,
            providerEarning,
            hoursWorked: booking.hoursWorked || 0
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
        if (!booking)
            return res.status(404).json({ success: false, message: "Booking not found" });

        if (["completed", "cancelled"].includes(booking.status)) {
            return res.status(400).json({ success: false, message: "Booking already closed" });
        }

        const conflict = await hasScheduleConflict(
            providerId,
            booking.appointmentStart,
            booking.appointmentEnd
        );

        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "You are unavailable or time conflicts with another booking."
            });
        }


        const alreadyAccepted = booking.providerCommissions.some(
            pc => pc.providerId?.toString() === providerId
        );

        if (alreadyAccepted) {
            return res.status(400).json({
                success: false,
                message: "You already accepted this booking"
            });
        }


        const emptySlot = booking.providerCommissions.find(
            pc => !pc.accepted && !pc.rejected
        );

        if (!emptySlot) {
            return res.status(400).json({
                success: false,
                message: "All provider slots already filled"
            });
        }


        emptySlot.providerId = providerId;
        emptySlot.accepted = true;


        booking.providerIds = booking.providerCommissions
            .filter(pc => pc.accepted)
            .map(pc => pc.providerId);

        const totalRequired = booking.providerCommissions.length;
        const totalAccepted = booking.providerCommissions.filter(pc => pc.accepted).length;
        const remainingProviders = totalRequired - totalAccepted;
        booking.status = remainingProviders === 0 ? "accepted" : "pending";

        await booking.save();

        res.json({
            success: true,
            message: remainingProviders === 0
                ? "All providers accepted. Ready to start."
                : `${remainingProviders} more provider(s) needed`,
            data: {
                remainingProviders,
                status: booking.status
            }
        });

    } catch (err) {
        console.error("Error in acceptBooking:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const listBookingsForProvider = async (req, res) => {
    try {
        const providerId = req.user.id;

        const provider = await Provider.findById(providerId).select("servicesOffered");
        if (!provider)
            return res.status(404).json({ success: false, message: "Provider not found" });

        const bookings = await Booking.find({
            serviceId: { $in: provider.servicesOffered },
            status: { $in: ["pending", "accepted", "in-progress", "completed"] },
            providerCommissions: {
                $elemMatch: {
                    $or: [
                        { providerId: new mongoose.Types.ObjectId(providerId) },
                        { providerId: null, accepted: false, rejected: false }
                    ]
                }
            }
        })
            .sort({ createdAt: -1 })
            .populate("serviceId", "name image category price_info commissionPercent")
            .populate("providerCommissions.providerId", "name image phone")
            .populate("customer", "name phone");

        const formatted = bookings.map(b => {

            const mySlot = b.providerCommissions.find(
                pc => pc.providerId?._id?.toString() === providerId
            );

            const allAccepted = b.providerCommissions.every(pc => pc.accepted);

            return {
                _id: b._id,
                status: b.status,
                customer: b.customer,
                appointmentStart: b.appointmentStart,
                appointmentEnd: b.appointmentEnd,
                pricePerHour: b.pricePerHour,
                providerCount: b.providerCount,
                finalPrice: b.finalPrice,
                service: b.serviceId,
                providers: b.providerCommissions.map(pc => ({
                    id: pc.providerId?._id,
                    name: pc.providerId?.name,
                    accepted: pc.accepted
                })),
                providerCommissions: b.providerCommissions,
                isAssigned: !!mySlot,
                canAccept: !mySlot && b.status === "pending",
                canStart: mySlot && allAccepted && b.status === "accepted",
                canComplete: mySlot && b.status === "in-progress",
                hoursWorked: b.hoursWorked || 0
            };
        });

        res.json({ success: true, data: formatted });

    } catch (err) {
        console.error("Error in listBookingsForProvider:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};




export const listBookingsForUser = async (req, res) => {
    try {

        const userId = req.user.id;

        const bookings = await Booking.find({ userId })
            .sort({ createdAt: -1 })
            .populate("serviceId", "name price_info")
            .populate("providerIds", "name phone email");
        const formatted = bookings.map(b => {
            const totalPrice = b.finalPrice ?? (b.pricePerHour * (b.providerCount || 1));
            return {
                _id: b._id,
                serviceName: b.serviceId?.name || "N/A",
                finalPrice: totalPrice,
                status: b.status,
                appointmentStart: b.appointmentStart,
                appointmentEnd: b.appointmentEnd,
                address: b.address,
                providers: b.providerIds,
                phone: b.phone
            };
        });

        res.json({
            success: true,
            data: formatted
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


export const cancelBooking = async (req, res) => {

    try {

        const userId = req.user.id;

        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);

        if (!booking)
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });

        if (booking.userId.toString() !== userId)
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });

        if (booking.status === "completed")
            return res.status(400).json({
                success: false,
                message: "Cannot cancel completed booking"
            });

        booking.status = "cancelled";

        await booking.save();

        res.json({

            success: true,

            message: "Booking cancelled"

        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};




export const completeBooking = async (req, res) => {
    try {
        const { hoursWorked } = req.body;
        const providerId = req.user.id;
        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId);
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        if (booking.status !== "in-progress") {
            return res.status(400).json({ success: false, message: "Booking is not in progress" });
        }

        const mySlot = booking.providerCommissions.find(
            pc => pc.providerId?.toString() === providerId && pc.accepted
        );

        if (!mySlot) {
            return res.status(403).json({ success: false, message: "You are not assigned to this booking" });
        }

        if (isNaN(hoursWorked) || hoursWorked <= 0) {
            return res.status(400).json({ success: false, message: "Invalid hours worked" });
        }

        const providerCount = booking.providerCount || 1;
        const finalPrice = booking.pricePerHour * hoursWorked * providerCount;
        const totalCommission = (finalPrice * booking.commissionPercent) / 100;


        const acceptedProviders = booking.providerCommissions.filter(pc => pc.accepted);
        const perProviderCommission = totalCommission / acceptedProviders.length;
        const perProviderEarning = (finalPrice - totalCommission) / acceptedProviders.length;

        booking.finalPrice = finalPrice;
        booking.commissionAmount = totalCommission;
        booking.providerEarning = finalPrice - totalCommission;
        booking.commissionPaid = false;
        booking.status = "completed";
        booking.endedAt = new Date();
        booking.hoursWorked = hoursWorked;


        booking.providerCommissions = booking.providerCommissions.map(pc => {
            if (pc.accepted) {
                return {
                    ...pc.toObject(),
                    commissionShare: perProviderCommission,
                    earningShare: perProviderEarning,
                    commissionPaid: pc.commissionPaid || false
                };
            }
            return pc;
        });

        await booking.save();

        res.json({ success: true, message: "Booking completed successfully", data: booking });

    } catch (err) {
        console.error("Error in completeBooking:", err);
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