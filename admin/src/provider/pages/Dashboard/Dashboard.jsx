import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProviderDashboard = () => {
    const [summary, setSummary] = useState({
        totalBookings: 0,
        newRequests: 0,
        pendingCommission: 0,
    });
    const [bookings, setBookings] = useState([]); // all bookings with any status
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("pToken");
    const navigate = useNavigate();

    // Fetch all bookings for this provider (any status)
    const fetchRecentBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/booking/provider`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setBookings(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching recent bookings:", err);
        }
    };

    // Fetch dashboard summary (KPIs)
    const fetchSummary = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/provider/dashboard-summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setSummary(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching summary:", err);
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            await fetchRecentBookings();
            await fetchSummary();
            setLoading(false);
        };
        fetchAll();
    }, []);

    // Handle booking start
    const handleStart = async (bookingId) => {
        try {
            const res = await axios.patch(
                `${API_URL}/api/provider/booking/${bookingId}/start`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setBookings((prev) =>
                    prev.map((b) =>
                        b._id === bookingId
                            ? { ...b, status: "in-progress", startedAt: new Date() }
                            : b
                    )
                );
            }
        } catch (err) {
            console.error(err);
            alert("Failed to start booking");
        }
    };

    // Handle booking end (also refresh summary for commission update)
    const handleEnd = async (bookingId) => {
        try {
            const res = await axios.patch(
                `${API_URL}/api/provider/booking/${bookingId}/end`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setBookings((prev) =>
                    prev.map((b) =>
                        b._id === bookingId
                            ? { ...b, status: "completed", ...res.data.data }
                            : b
                    )
                );
                await fetchSummary(); // refresh KPI after completion
            }
        } catch (err) {
            console.error(err);
            alert("Failed to end booking");
        }
    };

    if (loading) return <p>Loading dashboard...</p>;

    // Filter bookings for recent display (any status except pending that isn't assigned to provider)
    const pendingRequests = bookings.filter((b) => b.status === "pending");
    const recentBookings = bookings.filter((b) =>
        ["accepted", "in-progress", "completed"].includes(b.status)
    );

    return (
        <div className="dashboard-container">
            <h2>Provider Dashboard</h2>

            {/* KPI Cards */}
            <div className="kpi-cards">
                <div
                    className="card new-requests"
                    style={{ cursor: "pointer", position: "relative" }}
                    onClick={() => navigate("/provider/booking")}
                >
                    <h3>New Requests</h3>
                    <p>{pendingRequests.length}</p>
                    {pendingRequests.length > 0 && (
                        <span
                            style={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                background: "red",
                                color: "#fff",
                                borderRadius: "50%",
                                padding: "5px 10px",
                                fontSize: "12px",
                            }}
                        >
                            {pendingRequests.length}
                        </span>
                    )}
                </div>

                <div className="card total-bookings">
                    <h3>Total Bookings</h3>
                    <p>{summary.totalBookings}</p>
                </div>

                <div className="card pending-commission" style={{ cursor: "pointer" }} onClick={() => navigate("/provider/commission")}>
                    <h3>Pending Commission</h3>
                    <p>Rs. {Number(summary.pendingCommission || 0).toFixed(2)}</p>
                </div>

            </div>

            {/* Recent Bookings Table */}
            <h3>Recent Bookings</h3>
            {recentBookings.length === 0 ? (
                <p>No recent bookings.</p>
            ) : (
                <table className="booking-table" border="1" cellPadding="10">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Final Price</th>
                            <th>Commission</th>
                            <th>Provider Earning</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentBookings.map((b) => (
                            <tr key={b._id}>
                                <td>{b.customer?.name || "N/A"}</td>
                                <td>{b.service?.name || "N/A"}</td>
                                <td>{b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString() : "N/A"}</td>
                                <td>{b.appointmentTime || "N/A"}</td>
                                <td>{b.status}</td>
                                <td>{b.finalPrice ? b.finalPrice.toFixed(2) : "-"}</td>
                                <td>{b.status === "completed" && b.commissionAmount ? b.commissionAmount.toFixed(2) : "-"}</td>
                                <td>{b.status === "completed" && b.providerEarning ? b.providerEarning.toFixed(2) : "-"}</td>
                                <td>
                                    {b.status === "accepted" && (
                                        <button onClick={() => handleStart(b._id)}>Start</button>
                                    )}
                                    {b.status === "in-progress" && (
                                        <button onClick={() => handleEnd(b._id)}>End</button>
                                    )}
                                    {b.status === "completed" && <span>—</span>}
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
