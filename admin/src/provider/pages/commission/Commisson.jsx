import React, { useEffect, useState } from "react";
import axios from "axios";

const Commission = ({ url }) => {
    const [commissionData, setCommissionData] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("pToken");

    const fetchCommissions = async () => {
        try {
            const res = await axios.get(`${url}/api/provider/commissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setCommissionData(res.data.data || []);
            }
        } catch (err) {
            console.error("Error fetching commissions:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommissions();
    }, []);

    if (loading) return <p>Loading commissions...</p>;

    if (!commissionData || commissionData.length === 0) {
        return <p>No commissions available.</p>;
    }

    return (
        <div>
            <h2>Commission History</h2>
            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>Service</th>
                        <th>Customer</th>
                        <th>Hours Worked</th>
                        <th>Final Price</th>
                        <th>Commission (%)</th>
                        <th>Commission Amount</th>
                        <th>Provider Earning</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {commissionData.map(b => (
                        <tr key={b._id}>
                            <td>{b.service}</td>
                            <td>{b.customerName}</td>
                            <td>{Number(b.hoursWorked).toFixed(2)}</td>
                            <td>{Number(b.finalPrice).toFixed(2)}</td>
                            <td>{Number(b.commissionPercent).toFixed(2)}</td>
                            <td>{Number(b.commissionAmount).toFixed(2)}</td>
                            <td>{Number(b.providerEarning).toFixed(2)}</td>
                            <td>{b.commissionPaid ? "Paid" : "Pending"}</td>
                        </tr>
                    ))}
                </tbody>


            </table>
        </div>
    );
};

export default Commission;
