import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './revenue.css';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Revenue = ({ url }) => {
    const [period, setPeriod] = useState('monthly'); // weekly, monthly, yearly
    const [revenueOverTime, setRevenueOverTime] = useState({ labels: [], data: [] });
    const [topProviders, setTopProviders] = useState([]);
    const [topServices, setTopServices] = useState([]);
    const [detailedCommissions, setDetailedCommissions] = useState([]);

    useEffect(() => {
        fetchRevenueData();
    }, [period]);

    const fetchRevenueData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/admin/revenue`, {
                headers: { Authorization: `Bearer ${token}` },
                params: { period }
            });

            if (res.data.success) {
                const { overTime, topProviders, topServices, detailed } = res.data.data;

                setRevenueOverTime({
                    labels: overTime.map(item => item.label),
                    data: overTime.map(item => item.total)
                });

                setTopProviders(topProviders);
                setTopServices(topServices);
                setDetailedCommissions(detailed);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch revenue data");
        }
    };


    const revenueChart = {
        labels: revenueOverTime.labels,
        datasets: [{
            label: 'Commission Earned (Rs)',
            data: revenueOverTime.data,
            backgroundColor: '#2b6cb0'
        }]
    };

    const topProvidersChart = {
        labels: topProviders.map(p => p.name),
        datasets: [{
            label: 'Commission Earned (Rs)',
            data: topProviders.map(p => p.totalCommission),
            backgroundColor: '#38a169'
        }]
    };

    const topServicesChart = {
        labels: topServices.map(s => s.name),
        datasets: [{
            label: 'Commission Earned (Rs)',
            data: topServices.map(s => s.totalCommission),
            backgroundColor: '#dd6b20'
        }]
    };

    return (
        <div className="revenue-container">
            <h2>Earned Revenue Report</h2>

            <div className="period-selector">
                <label>Report Period: </label>
                <select value={period} onChange={e => setPeriod(e.target.value)}>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>

            <div className="chart-wrapper">
                <h3>Total Commission Over Time</h3>
                <Bar data={revenueChart} />
            </div>

            <div className="top-charts">
                <div className="chart-wrapper half-width">
                    <h3>Top Earning Providers</h3>
                    <Bar data={topProvidersChart} />
                </div>
                <div className="chart-wrapper half-width">
                    <h3>Top Earning Services</h3>
                    <Bar data={topServicesChart} />
                </div>
            </div>

            <div className="table-wrapper full-width">
                <h3>Paid Commissions Details</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Service</th>
                            <th>Provider</th>
                            <th>Commission Paid (Rs)</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {detailedCommissions.length > 0 ? detailedCommissions.map((c, i) => (
                            <tr key={i}>
                                <td>{c.serviceName}</td>
                                <td>{c.providerName}</td>
                                <td>{c.commissionPaid ? "Yes" : "No"}</td>
                                <td>{new Date(c.paidAt).toLocaleDateString()}</td>
                            </tr>
                        )) : (
                            <tr><td colSpan="4">No commissions paid in this period</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Revenue;