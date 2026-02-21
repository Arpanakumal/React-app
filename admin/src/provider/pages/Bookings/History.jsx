import React, { useEffect, useState } from "react";
import axios from "axios";
import './history.css';

const Bookinghistory = ({ url }) => {
    const [bookings, setBookings] = useState([]);
    const token = localStorage.getItem("pToken");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get(`${url}/api/provider/booking/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) {
                    setBookings(res.data.data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="booking-history-container" >
            <h2>Booking History</h2>

            {bookings.length === 0 ? (
                <p>No bookings yet.</p>
            ) : (
                <table className="booking-history-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b._id}>
                                <td>{b.customer?.name || "N/A"}</td>
                                <td>{b.serviceId?.name || "N/A"}</td>
                                <td>{b.status}</td>
                                <td>
                                    {b.appointmentDate
                                        ? new Date(b.appointmentDate).toLocaleDateString()
                                        : "N/A"}
                                </td>

                                <td>
                                    {b.status === "completed"
                                        ? Number(b.hoursWorked || 0).toFixed(2)
                                        : "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Bookinghistory;
