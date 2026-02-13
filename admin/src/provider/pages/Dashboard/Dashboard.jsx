import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const ProviderDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem("pToken");
                if (!token) return navigate("/provider/login");

                const decoded = jwtDecode(token);
                if (decoded.role !== "provider") return navigate("/provider/login");

                const res = await axios.get(`${API_URL}/api/booking/provider`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.data.success) setBookings(res.data.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            }
        };

        fetchBookings();
    }, []);

    const handleAccept = async (id) => {
        try {
            const token = localStorage.getItem("pToken");
            await axios.patch(
                `${API_URL}/api/booking/${id}/accept`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBookings(prev => prev.filter(b => b._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Provider Dashboard</h2>
            {bookings.length === 0 ? (
                <p>No new booking requests for your services.</p>
            ) : (
                <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Price</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b) => (
                            <tr key={b._id}>
                                <td>{b.customer?.firstName ? `${b.customer.firstName} ${b.customer.lastName || ""}` : b.username}</td>
                                <td>{b.service?.name}</td>
                                <td>{new Date(b.appointmentDate).toLocaleDateString()}</td>
                                <td>{b.appointmentTime}</td>
                                <td>₹{b.pricePerHour?.toLocaleString()}</td>
                                <td>
                                    <button onClick={() => handleAccept(b._id)}>Accept</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ProviderDashboard;
