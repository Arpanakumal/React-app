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

        if (!start || !end || start >= end) return true;

        const provider = await Provider.findById(providerId);
        if (!provider || !provider.availability?.isAvailable) return true;

        const dayMap = [
            "Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"
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



export const findAvailableProvider = async (
    providerIds,
    appointmentStart,
    appointmentEnd
) => {
    try {
        const availableProviders = [];

        for (let id of providerIds) {
            const hasConflict = await hasScheduleConflict(
                id,
                appointmentStart,
                appointmentEnd
            );

            if (!hasConflict) {
                availableProviders.push(id);
            }
        }


        if (availableProviders.length === 0) {
            return {
                success: false,
                message: "All providers are booked for this time slot",
                availableProviders: []
            };
        }

        return {
            success: true,
            message: "Providers available",
            availableProviders
        };

    } catch (error) {
        console.error("Error finding available providers:", error);
        return {
            success: false,
            message: "Error checking provider availability",
            availableProviders: []
        };
    }
};