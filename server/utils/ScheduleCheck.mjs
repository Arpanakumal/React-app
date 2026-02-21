import Booking from "../models/BookingModel.mjs";
import Provider from "../models/ProviderModel.mjs";

/**
 * Checks if a provider can accept a booking at a specific date/time
 *
 */

export const hasScheduleConflict = async (providerId, appointmentDate, appointmentTime, serviceDuration = 60) => {
    const start = new Date(`${appointmentDate}T${appointmentTime}`);
    const end = new Date(start.getTime() + serviceDuration * 60000);

    const provider = await Provider.findById(providerId);
    if (!provider || !provider.availability?.isAvailable) return true;

    const dayMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = dayMap[start.getDay()];
    if (!provider.availability.workingDays.includes(dayOfWeek)) return true;

    const [workStartHour, workStartMinute] = provider.availability.startTime.split(":").map(Number);
    const [workEndHour, workEndMinute] = provider.availability.endTime.split(":").map(Number);

    const workStart = new Date(start);
    workStart.setHours(workStartHour, workStartMinute, 0, 0);

    const workEnd = new Date(start);
    workEnd.setHours(workEndHour, workEndMinute, 0, 0);

    if (start < workStart || end > workEnd) return true;

    const conflict = await Booking.findOne({
        providerIds: providerId,
        status: { $in: ["accepted", "in-progress"] },
        $expr: {
            $and: [
                { $lt: ["$appointmentTime", end.toISOString()] },
                { $gt: [{ $add: ["$appointmentTime", serviceDuration * 60000] }, start.toISOString()] }
            ]
        }
    });

    return !!conflict;
};