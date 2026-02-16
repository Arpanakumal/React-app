import React, { useEffect, useState } from "react";
import axios from "axios";

const ProviderBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get API URL from Vite env
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get token from localStorage
                const token = localStorage.getItem("pToken");
                if (!token) {
                    setError("No token found. Please log in.");
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`${API_URL}/api/booking/provider`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.data.success) {
                    setBookings(res.data.data || []);
                } else {
                    setError(res.data.message || "Failed to fetch bookings");
                }
            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.response?.data?.message || err.message || "Server error");
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [API_URL]);

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!bookings.length) return <p>No bookings found.</p>;

    return (
        <div>
            <h2>Provider Bookings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Status</th>
                        <th>Final Price</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b._id}>
                            <td>{b.customer?.name || "N/A"}</td>
                            <td>{b.service?.name || "N/A"}</td>
                            <td>{new Date(b.appointmentDate).toLocaleDateString()}</td>
                            <td>{b.appointmentTime}</td>
                            <td>{b.status}</td>
                            <td>{b.finalPrice}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProviderBooking;
