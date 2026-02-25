import Booking from "../models/BookingModel.mjs";
import Provider from "../models/ProviderModel.mjs";

/**
 * Checks if a provider has a scheduling conflict
 */
export const hasScheduleConflict = async (
    providerId,
    appointmentStart,
    appointmentEnd
) => {
    try {
        const start = new Date(appointmentStart);
        const end = new Date(appointmentEnd);

        if (!start || !end || start >= end) return true;

        const provider = await Provider.findById(providerId);
        if (!provider || !provider.availability?.isAvailable) return true;

        const dayMap = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
        ];

        const dayOfWeek = dayMap[start.getDay()];

        if (!provider.availability.workingDays.includes(dayOfWeek)) {
            return true;
        }

        const [startHour, startMinute] =
            provider.availability.startTime.split(":").map(Number);

        const [endHour, endMinute] =
            provider.availability.endTime.split(":").map(Number);

        const workStart = new Date(start);
        workStart.setHours(startHour, startMinute, 0, 0);

        const workEnd = new Date(start);
        workEnd.setHours(endHour, endMinute, 0, 0);

        if (start < workStart || end > workEnd) {
            return true;
        }


        const conflict = await Booking.findOne({
            providerIds: providerId,
            status: { $in: ["accepted", "in-progress"] },
            appointmentStart: { $lt: end },
            appointmentEnd: { $gt: start }
        });

        return !!conflict;

    } catch (error) {
        console.error("Schedule conflict check error:", error);
        return true; 
    }
};