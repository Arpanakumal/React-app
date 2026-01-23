import Booking from "../models/BookingModel.mjs";


export const listBookings = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const bookings = await Booking.find()
            .sort({ date: -1 })
            .limit(limit);

        res.json({ data: bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createBooking = async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        res.json({ data: booking });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
