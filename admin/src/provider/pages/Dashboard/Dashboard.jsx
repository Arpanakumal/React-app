import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProviderDashboard = () => {
    const [summary, setSummary] = useState({
        totalBookings: 0,
        pendingCommission: 0,
        averageRating: 0,
        rankingScore: 0,
    });

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("pToken");
    const currentProviderId = localStorage.getItem("provider_id")?.toString();
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
            console.error(err);
            toast.error("Failed to load bookings");
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
                    averageRating: res.data.data.averageRating || 0,
                    rankingScore: res.data.data.rankingScore || 0,
                });
            }
        } catch (err) {
            console.error(err);
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

    const handleReject = async (bookingId) => {
        try {
            const res = await axios.post(
                `${API_URL}/api/booking/reject`,
                { bookingId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Booking rejected");
                fetchRecentBookings();
            }
        } catch {
            toast.error("Failed to reject booking");
        }
    };

    if (loading) return <p>Loading dashboard...</p>;


    const pendingRequests = bookings.filter(b =>
        b.status === "pending" &&
        b.providerCommissions.some(pc =>
            !pc.accepted &&
            !pc.providerId &&
            (!pc.rejectedBy ||
                !pc.rejectedBy.some(id => id.toString() === currentProviderId))
        )
    );

    const recentBookings = bookings.filter(b =>
        ["accepted", "in-progress"].includes(b.status)
    );

    return (
        <div className="dashboard-container">
            <h2>Dashboard</h2>


            <div className="kpi-cards">
                <div
                    className="card new-requests"
                    onClick={() => navigate("/provider/booking")}
                >
                    <h3>{pendingRequests.length}</h3>
                    <p>New Requests</p>
                </div>

                <div
                    className="card total-bookings"
                    onClick={() => navigate("/provider/history")}
                >
                    <h3>{summary.totalBookings}</h3>
                    <p>Total Bookings</p>
                </div>

                <div
                    className="card pending-commission"
                    onClick={() => navigate("/provider/commission")}
                >
                    <h3>Rs. {Number(summary.pendingCommission).toFixed(2)}</h3>
                    <p>Pending Commission</p>
                </div>
            </div>

            <h3>Recent Bookings</h3>

            {recentBookings.length === 0 ? (
                <p>No recent bookings.</p>
            ) : (
                recentBookings.map(b => {

                    let mySlot = b.providerCommissions.find(
                        pc => pc.providerId?._id?.toString() === currentProviderId
                    );

                    if (!mySlot) {
                        mySlot = b.providerCommissions.find(pc =>
                            !pc.providerId &&
                            (!pc.rejectedBy ||
                                !pc.rejectedBy.some(id => id.toString() === currentProviderId))
                        );
                    }


                    const partnerProviders = b.providerCommissions
                        .filter(pc =>
                            pc.accepted &&
                            pc.providerId?._id?.toString() !== currentProviderId
                        )
                        .map(pc => ({
                            id: pc.providerId._id,
                            name: pc.providerId.name || "N/A",
                            phone: pc.providerId.phone || "N/A",
                            earning: pc.earningShare || 0
                        }));

                    return (
                        <div key={b._id} className="booking-block">
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
                                        <th>Earning</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    <tr>
                                        <td>{b.customer?.name || "N/A"}</td>
                                        <td>{b.service?.name || "N/A"}</td>
                                        <td>{new Date(b.appointmentStart).toLocaleDateString()}</td>
                                        <td>{new Date(b.appointmentStart).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                                        <td>{b.status}</td>
                                        <td>{b.hoursWorked || "-"}</td>
                                        <td>{b.finalPrice || "-"}</td>
                                        <td>{mySlot?.commissionShare || "-"}</td>
                                        <td>{mySlot?.earningShare || "-"}</td>

                                        <td>
                                            {b.status === "accepted" && (
                                                <button onClick={() => handleStart(b._id)}>Start</button>
                                            )}

                                            {b.status === "in-progress" && (
                                                <button onClick={() => handleEnd(b._id)}>End</button>
                                            )}

                                            {b.status === "pending" && (
                                                <button
                                                    onClick={() => handleReject(b._id)}
                                                    style={{ background: "red", color: "#fff" }}
                                                >
                                                    Reject
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>


                            {partnerProviders.length > 0 && (
                                <div>
                                    <h5>Partner Providers</h5>
                                    <table className="booking-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Phone</th>
                                                <th>Earning</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {partnerProviders.map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.name}</td>
                                                    <td>{p.phone}</td>
                                                    <td>{p.earning}</td>
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