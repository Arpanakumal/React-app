import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import './mybooking.css';
import { StoreContext } from "../../context/StoreContext";
import { toast } from "react-toastify";

const MyBooking = () => {
    const { url, token } = useContext(StoreContext);
    const [bookings, setBookings] = useState([]);
    const [rating, setRating] = useState({});
    const [review, setReview] = useState({});

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

    const submitRating = async (bookingId, providerId) => {
        if (!rating[providerId]) return toast.error("Select a rating");
        try {
            const res = await axios.post(`${url}/booking/rate`, {
                bookingId,
                providerId,
                rating: Number(rating[providerId]),
                review: review[providerId] || ""
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Rating submitted");
                fetchBookings();
                setRating(prev => ({ ...prev, [providerId]: "" }));
                setReview(prev => ({ ...prev, [providerId]: "" }));
            }
        } catch {
            toast.error("Rating failed");
        }
    };

    const getAverageRating = (booking, providerId) => {
        const ratings = booking.ratings?.filter(r => r.providerId === providerId) || [];
        if (!ratings.length) return 0;
        const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
        return (sum / ratings.length).toFixed(1);
    };

    return (
        <div className="mybooking-container">
            <h2 className="mybooking-title">My Bookings</h2>

            {bookings.length === 0 && <p className="no-bookings">No bookings found</p>}

            {bookings.map(b => (
                <div key={b._id} className="booking-card">
                    <div className="booking-info">
                        <h3>{b.service?.name || b.serviceName}</h3>
                        <p>Date: {new Date(b.appointmentStart).toLocaleDateString()}</p>
                        <p>Time: {new Date(b.appointmentStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className={`status ${b.status}`}>{b.status}</p>
                        <p>Total: Rs.{Number(b.finalPrice ?? 0).toFixed(2)}</p>
                        <p>Address: {b.address?.city || "N/A"}</p>

                        {b.providers?.length > 0 && b.providers.map(p => (
                            <div key={p._id} className="provider-info">
                                <p>Provider: {p.name}</p>
                                <p>Phone: {p.phone}</p>


                                {b.ratings?.some(r => r.providerId === p._id) && (
                                    <p>
                                        Average Rating: {"★".repeat(Math.round(getAverageRating(b, p._id)))}{"☆".repeat(5 - Math.round(getAverageRating(b, p._id)))} ({getAverageRating(b, p._id)})
                                    </p>
                                )}


                                {b.status === "completed" && !b.ratings?.some(r => r.providerId === p._id) && (
                                    <div className="rating-section">
                                        <select
                                            value={rating[p._id] || ""}
                                            onChange={e => setRating({ ...rating, [p._id]: e.target.value })}
                                        >
                                            <option value="">Rate</option>
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Leave a review"
                                            value={review[p._id] || ""}
                                            onChange={e => setReview({ ...review, [p._id]: e.target.value })}
                                        />
                                        <button onClick={() => submitRating(b._id, p._id)}>Submit</button>
                                    </div>
                                )}
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