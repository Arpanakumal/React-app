import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import './mybooking.css';
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const MyBooking = () => {
    const { url, token } = useContext(StoreContext);
    const [bookings, setBookings] = useState([]);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const res = await axios.get(`${url}/booking/user`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setBookings(res.data.data);
        } catch {
            toast.error("Failed to load bookings");
        }
    };

    const cancelBooking = async (id) => {
        if (!window.confirm("Cancel booking?")) return;
        try {
            const res = await axios.patch(`${url}/booking/${id}/cancel`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success("Booking cancelled");
                fetchBookings();
            }
        } catch {
            toast.error("Cancel failed");
        }
    };

    return (
        <div className="mybooking-container">
            <h2 className="mybooking-title">My Bookings</h2>

            {bookings.length === 0 && <p>No bookings found</p>}

            {bookings.map(b => (
                <div key={b._id} className="booking-card">
                    <div className="booking-info">
                        <h3>{b.service?.name || b.serviceName}</h3>
                        <p>Date: {new Date(b.appointmentStart).toLocaleDateString()}</p>
                        <p>Time: {new Date(b.appointmentStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className={`status ${b.status}`}>{b.status}</p>


                        <p>
                            Total: Rs.{Number(b.finalPrice ?? 0).toFixed(2)}
                        </p>
                        <p>Address: {b.address?.city}</p>

                        {b.providers?.length > 0 && b.providers.map(p => (
                            <div key={p._id}>
                                Provider: {p.name}<br />
                                Phone: {p.phone}
                            </div>
                        ))}
                    </div>

                    {b.status !== "completed" && b.status !== "cancelled" &&
                        <button className="cancel-btn" onClick={() => cancelBooking(b._id)}>Cancel</button>
                    }
                </div>
            ))}
        </div>
    );
};

export default MyBooking;