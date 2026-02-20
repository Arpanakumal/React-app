import React, { useEffect, useState } from "react";
import "./bookings.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProviderBooking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("pToken");
    const providerId = localStorage.getItem("pId");

    const fetchBookings = async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            const res = await axios.get(
                `${API_URL}/api/booking/provider`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                // Only pending bookings
                setBookings(res.data.data.filter(b => b.status === "pending"));
            } else {
                throw new Error(res.data.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const respondToBooking = async (bookingId, action) => {
        try {
            const res = await axios.patch(
                `${API_URL}/api/provider/booking/respond`,
                { bookingId, action },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                const { remainingProviders, allAccepted } = res.data.data;

                if (action === "accept") {
                    if (allAccepted) {
                        toast.success("All providers accepted. Job is ready to start.");
                    } else {
                        toast.info(`${remainingProviders} more provider(s) needed`);
                    }
                } else {
                    toast.info("You rejected the booking");
                }

                fetchBookings();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Server error");
        }
    };

    if (loading) return <p>Loading bookings...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!bookings.length) return <p>No pending bookings.</p>;

    return (
        <div className="provider-booking">
            <h2>Pending Bookings</h2>
            <table>
                <thead>
                    <tr>
                        <th>Customer</th>
                        <th>Service</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Partners</th>
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
                                {(b.providerCommissions || [])
                                    .filter(pc => pc.accepted && pc.providerId !== providerId)
                                    .map(pc => (
                                        <div key={pc.providerId}>
                                            Partner: {pc.providerName || "N/A"}
                                        </div>
                                    ))
                                }
                            </td>
                            <td>
                                {b.canAccept && (
                                    <button
                                        onClick={e => {
                                            e.stopPropagation();
                                            respondToBooking(b._id, "accept");
                                        }}
                                    >
                                        Accept
                                    </button>
                                )}
                                {b.canAccept && (
                                    <button
                                        className="reject"
                                        onClick={e => {
                                            e.stopPropagation();
                                            respondToBooking(b._id, "reject");
                                        }}
                                    >
                                        Reject
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProviderBooking;