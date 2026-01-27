import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./booking.css";

const AdminBookingPanel = ({ url }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${url}/api/Booking/list`);
            setBookings(res.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching bookings");
            setLoading(false);
        }
    };

    const updateStatus = async (bookingId, newStatus) => {
        try {
            await axios.put(`${url}/api/Booking/update/${bookingId}`, { status: newStatus });
            toast.success("Status updated");
            fetchBookings();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="admin-booking-panel">
            <h2>Bookings</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="booking-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Job Value</th>
                            <th>Commission %</th>
                            <th>Commission Due</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b._id}>
                                <td>{b.customerName}</td>
                                <td>{b.serviceName}</td>
                                <td>{b.providerName || "Not assigned"}</td>
                                <td>{b.status}</td>
                                <td>{new Date(b.date).toLocaleString()}</td>
                                <td>Rs. {b.price_info}</td>
                                <td>{b.commissionPercent || 0}%</td>
                                <td>Rs. {((b.price_info * (b.commissionPercent || 0)) / 100).toFixed(2)}</td>
                                <td>
                                    <select
                                        value={b.status}
                                        onChange={(e) => updateStatus(b._id, e.target.value)}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminBookingPanel;
