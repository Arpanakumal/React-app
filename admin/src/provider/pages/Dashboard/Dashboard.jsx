import React, { useEffect, useState } from "react";
import axios from "axios";
import './dashboard.css';
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProviderDashboard = () => {
    const [summary, setSummary] = useState({
        totalBookings: 0,
        pendingCommission: 0,
    });
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("pToken");
    const currentProviderId = localStorage.getItem("provider_id");

    const navigate = useNavigate();


    const fetchRecentBookings = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/booking/provider`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                const safeBookings = (res.data.data || []).map(b => ({
                    ...b,
                    providerCommissions: Array.isArray(b.providerCommissions)
                        ? b.providerCommissions
                        : []
                }));
                setBookings(safeBookings);
            }
        } catch (err) {
            console.error("Error fetching recent bookings:", err);
            toast.error("Failed to load recent bookings");
        }
    };

    const fetchDashboardSummary = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/provider/dashboard-summary`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setSummary({
                    totalBookings: res.data.data.totalBookings || 0,
                    pendingCommission: res.data.data.pendingCommission || 0,
                });
            }
        } catch (err) {
            console.error("Error fetching dashboard summary:", err);
            toast.error("Failed to load dashboard summary");
        }
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            await fetchRecentBookings();
            await fetchDashboardSummary();
            setLoading(false);
        };
        fetchAll();
    }, []);

    const handleStart = async (bookingId) => {
        try {
            const res = await axios.patch(
                `${API_URL}/api/provider/booking/${bookingId}/start`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success("Job started");
                fetchRecentBookings();
            }
        } catch {
            toast.error("Cannot start job");
        }
    };


    const handleEnd = async (bookingId) => {
        try {
            const res = await axios.patch(
                `${API_URL}/api/provider/booking/${bookingId}/end`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                toast.success("Job completed");
                fetchRecentBookings();
            }
        } catch {
            toast.error("Cannot end job");
        }
    };

    if (loading) return <p>Loading dashboard...</p>;

    const pendingRequests = bookings.filter(b => b.status === "pending");
    const recentBookings = bookings.filter(b =>
        ["accepted", "in-progress", "completed"].includes(b.status)
    );

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>


            <div className="kpi-cards">
                <div
                    className="card new-requests"
                    onClick={() => navigate("/provider/booking")}
                >
                    <h3>New Requests</h3>
                    <p className="kpi-number">{pendingRequests.length}</p>
                </div>

                <div
                    className="card total-bookings"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/provider/history")}
                >
                    <h3>Total Bookings</h3>
                    <p>{summary.totalBookings}</p>
                </div>

                <div
                    className="card pending-commission"
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/provider/commission")}
                >
                    <h3>Pending Commission</h3>
                    <p>Rs. {Number(summary.pendingCommission).toFixed(2)}</p>
                </div>
            </div>

            <h3>Recent Bookings</h3>

            {recentBookings.length === 0 ? (
                <p>No recent bookings.</p>
            ) : (
                recentBookings.map(b => {

                    const partnerProviders = (b.providerCommissions || [])
                        .filter(
                            pc =>
                                pc.accepted &&
                                pc.providerId &&
                                pc.providerId._id?.toString() !== currentProviderId
                        )
                        .map(pc => ({
                            id: pc.providerId._id,
                            name: pc.providerId?.name || "N/A",
                            phone: pc.providerId?.phone || "N/A",
                            earning: pc.earningShare || pc.commissionShare || 0
                        }));

                    const mySlot = (b.providerCommissions || []).find(
                        pc => pc.providerId?._id?.toString() === currentProviderId
                    );

                    return (
                        <div key={b._id} className="booking-block" style={{ marginBottom: "2rem" }}>
                            <table className="booking-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Service</th>
                                        <th>Date</th>
                                        <th>Time</th>
                                        <th>Status</th>
                                        <th>Hours</th>
                                        <th>Final Price</th>
                                        <th>Commission</th>
                                        <th>Provider Earning</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{b.customer?.name || "N/A"}</td>
                                        <td>{b.service?.name || "N/A"}</td>
                                        <td>{b.appointmentStart ? new Date(b.appointmentStart).toLocaleDateString() : "N/A"}</td>
                                        <td>{b.appointmentStart ? new Date(b.appointmentStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</td>
                                        <td>{b.status}</td>
                                        <td>{b.hoursWorked?.toFixed(2) || "-"}</td>
                                        <td>{b.finalPrice?.toFixed(2) || "-"}</td>
                                        <td>{mySlot?.commissionShare?.toFixed(2) || "-"}</td>
                                        <td>{mySlot?.earningShare?.toFixed(2) || "-"}</td>
                                        <td>
                                            {b.status === "accepted" && <button onClick={() => handleStart(b._id)}>Start</button>}
                                            {b.status === "in-progress" && <button onClick={() => handleEnd(b._id)}>End</button>}
                                            {b.status === "completed" && <span>—</span>}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                            {partnerProviders.length > 0 && (
                                <div style={{ marginTop: "1rem" }}>
                                    <h5>Partner Providers</h5>
                                    <table className="booking-table partner-table">
                                        <thead>
                                            <tr>
                                                <th>Partner Provider</th>
                                                <th>Phone</th>
                                                <th>Earning Share</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {partnerProviders.map(pc => (
                                                <tr key={pc.id}>
                                                    <td>{pc.name}</td>
                                                    <td>{pc.phone}</td>
                                                    <td>{pc.earning?.toFixed(2) || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default ProviderDashboard;