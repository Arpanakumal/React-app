import React, { useEffect, useState } from "react";
import './bookings.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProviderBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("pToken");


    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(`${API_URL}/api/booking/provider`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {

                setBookings(res.data.data.filter(b => b.status === "pending"));
            } else {
                throw new Error(res.data.message || "Failed to fetch bookings");
            }
        } catch (err) {
            setError(err.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [API_URL]);


    const respondToBooking = async (bookingId, action) => {
        try {
            const res = await axios.patch(
                `${API_URL}/api/provider/booking/${bookingId}/respond`,
                { action },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {

                setBookings(prev => prev.filter(b => b._id !== bookingId));
            } else {
                alert(res.data.message);
            }
        } catch (err) {
            console.error("Booking response error:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Server error");
        }
    };

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!bookings.length) return <p>No pending bookings.</p>;

    return (
        <div className="provider-booking">
            <h2>Pending Bookings</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map(b => (
                        <tr key={b._id} onClick={() => navigate(`/provider/bookings/${b._id}`)}>
                            <td>{b.customer?.name || "N/A"}</td>
                            <td>{b.service?.name || "N/A"}</td>
                            <td>{new Date(b.appointmentDate).toLocaleDateString()}</td>
                            <td>{b.appointmentTime}</td>
                            <td>
                                <button onClick={e => { e.stopPropagation(); respondToBooking(b._id, "accept"); }}>
                                    Accept
                                </button>
                                <button className="reject" onClick={e => { e.stopPropagation(); respondToBooking(b._id, "reject"); }}>
                                    Reject
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProviderBooking;
