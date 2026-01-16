import React, { useState, useEffect } from 'react';

const mockBookings = [
    {
        id: "b1",
        services: [
            { name: "Haircut", providers: 1, provider: { name: "John Doe", phone: "12345", email: "john@example.com" } },
        ],
        date: "2026-01-20",
        time: "15:00",
        total: 500,
    },
    {
        id: "b2",
        services: [
            { name: "Massage", providers: 2, provider: { name: "Alice Smith", phone: "67890", email: "alice@example.com" } },
        ],
        date: "2026-01-22",
        time: "12:00",
        total: 1200,
    },
];

const MyBooking = () => {
    const [bookings, setBookings] = useState([]);


    useEffect(() => {
        setBookings(mockBookings);
    }, []);


    const cancelBooking = (id) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
        if (!confirmCancel) return;

        setBookings((prev) => prev.filter(b => b.id !== id));
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>My Bookings</h2>
            {bookings.length === 0 ? (
                <p>No bookings found.</p>
            ) : (
                bookings.map((booking) => (
                    <div key={booking.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
                        <h4>Booking ID: {booking.id}</h4>
                        <p><strong>Date:</strong> {booking.date}</p>
                        <p><strong>Time:</strong> {booking.time}</p>
                        <p><strong>Total:</strong> Rs.{booking.total}</p>
                        <div>
                            {booking.services.map((s, idx) => (
                                <div key={idx} style={{ marginTop: '10px', paddingLeft: '10px' }}>
                                    <p><strong>Service:</strong> {s.name}</p>
                                    <p><strong>Providers:</strong> {s.providers}</p>
                                    <p><strong>Provider Name:</strong> {s.provider.name}</p>
                                    <p><strong>Phone:</strong> {s.provider.phone}</p>
                                    <p><strong>Email:</strong> {s.provider.email}</p>
                                </div>
                            ))}
                        </div>
                        <button
                            style={{ marginTop: '10px', backgroundColor: '#ff4d4f', color: '#fff', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => cancelBooking(booking.id)}
                        >
                            Cancel Booking
                        </button>
                    </div>
                ))
            )}
        </div>
    );
};

export default MyBooking;
