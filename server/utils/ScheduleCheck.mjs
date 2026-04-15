import Booking from "../models/BookingModel.mjs";
import Provider from "../models/ProviderModel.mjs";

export const hasScheduleConflict = async (
    providerId,
    appointmentStart,
    appointmentEnd
) => {
    try {
        const start = new Date(appointmentStart);
        const end = new Date(appointmentEnd);

        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
            return { conflict: true, reason: "Invalid time slot" };
        }

        const provider = await Provider.findById(providerId);

        if (!provider) {
            return { conflict: true, reason: "Provider not found" };
        }

        const isAvailable =
            provider?.availability?.isAvailable ?? provider?.available;

        if (!provider || isAvailable !== true) {
            return { conflict: true, reason: "Provider not available" };
        }
        const dayMap = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
        ];

        const dayOfWeek = dayMap[start.getDay()];


        const workingDays = provider.availability?.workingDays || [];

        if (!workingDays.includes(dayOfWeek)) {
            return { conflict: true, reason: "Not a working day" };
        }

        const [startHour, startMinute] =
            (provider.availability?.startTime || "00:00").split(":").map(Number);

        const [endHour, endMinute] =
            (provider.availability?.endTime || "23:59").split(":").map(Number);

        const workStart = new Date(start);
        workStart.setHours(startHour, startMinute, 0, 0);

        const workEnd = new Date(start);
        workEnd.setHours(endHour, endMinute, 0, 0);

        if (start < workStart || end > workEnd) {
            return { conflict: true, reason: "Outside working hours" };
        }

        const existingBooking = await Booking.findOne({
            providerIds: providerId,
            status: { $in: ["accepted", "in-progress"] },
            appointmentStart: { $lt: end },
            appointmentEnd: { $gt: start }
        });

        if (existingBooking) {
            return { conflict: true, reason: "Time slot already booked" };
        }

        return { conflict: false };

    } catch (error) {
        console.error("Schedule conflict check error:", error);
        return { conflict: true, reason: "Server error" };
    }
};