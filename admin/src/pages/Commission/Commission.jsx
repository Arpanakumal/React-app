import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Commission = ({ url }) => {
    const [pendingCommissions, setPendingCommissions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingCommissions();
    }, []);

    const fetchPendingCommissions = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/admin/pending-commissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setPendingCommissions(res.data.data);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch pending commissions");
        } finally {
            setLoading(false);
        }
    };

    const markPaid = async (bookingId, providerId) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${url}/api/admin/mark-commission-paid`,
                { bookingId, providerId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success("Commission marked as paid");
                fetchPendingCommissions(); // refresh table
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to mark commission paid");
        }
    };

    return (
        <div className="pending-commissions-container">
            <h2>Pending Commissions</h2>
            {loading ? (
                <p>Loading...</p>
            ) : pendingCommissions.length === 0 ? (
                <p>No pending commissions</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Commission Amount (Rs)</th>
                            <th>Booking Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingCommissions.map((pc, i) => (
                            <tr key={`${pc.bookingId}-${pc.providerId}`}>
                                <td>{pc.service || "N/A"}</td>
                                <td>{pc.providerName || "N/A"}</td>
                                <td>{Number(pc.commissionAmount || 0).toFixed(2)}</td>
                                <td>{new Date(pc.date).toLocaleDateString()}</td>
                                <td>
                                    <button
                                        onClick={() => markPaid(pc.bookingId, pc.providerId)}
                                        className="action-btn"
                                    >
                                        Mark Paid
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Commission;