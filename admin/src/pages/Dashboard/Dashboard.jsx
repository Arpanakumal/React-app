import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = ({ url }) => {
    const navigate = useNavigate();

    const [metrics, setMetrics] = useState({
        totalBookings: 0,
        completedJobs: 0,
        activeProviders: 0,
        pendingCommission: 0,
    });

    const [recentBookings, setRecentBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);
    const [monthlyCommission, setMonthlyCommission] = useState({ labels: [], data: [] });

    useEffect(() => {
        fetchDashboardMetrics();
        fetchRecentBookings();
        fetchRecentUsers();
    }, []);

    const displayStatus = (status) => {
        switch (status) {
            case 'pending': return 'Pending';
            case 'accepted': return 'Accepted';
            case 'in-progress': return 'In Progress';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    };

    const fetchDashboardMetrics = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/admin/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setMetrics(res.data.data);

                const monthlyData = res.data.data.monthlyCommission || [];

                const labels = monthlyData.map(item => {
                    const date = new Date(item.year, item.month - 1);
                    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
                });

                const data = monthlyData.map(item => item.totalCommission);

                setMonthlyCommission({ labels, data });

            } else {
                toast.error("Failed to fetch dashboard metrics");
            }
        } catch (error) {
            console.error("Dashboard metrics error:", error);
            toast.error("Error fetching dashboard metrics");
        }
    };

    const fetchRecentBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/booking/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const bookings = res.data?.data || [];
            setRecentBookings(bookings.slice(-5).reverse());
        } catch (error) {
            console.error("Error fetching recent bookings:", error);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/user/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const users = res.data?.data || [];
            setRecentUsers(users.slice(-5).reverse());
        } catch (error) {
            console.error("Error fetching recent users:", error);
        }
    };

    const chartData = {
        labels: monthlyCommission.labels,
        datasets: [
            {
                label: 'Commission Earned (Rs)',
                data: monthlyCommission.data,
                backgroundColor: '#2b6cb0',
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Monthly Commission Revenue' },
        },

    };

    return (
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>

            <div className="kpi-cards">
                <div className="card">
                    <h3>Rs.{metrics.pendingCommission}</h3>
                    <p>Pending Commission</p>
                </div>
                <div className="card">
                    <h3>{metrics.totalBookings}</h3>
                    <p>Total Bookings</p>
                </div>
                <div className="card">
                    <h3>{metrics.completedJobs}</h3>
                    <p>Completed Jobs</p>
                </div>
                <div className="card">
                    <h3>{metrics.activeProviders}</h3>
                    <p>Active Providers</p>
                </div>
            </div>


            <div className="chart-wrapper" onClick={() => navigate('/revenue')}>
                <h3>Monthly Commission Revenue</h3>
                <Bar data={chartData} options={chartOptions} />
            </div>

            <div className="tables-section">

                <div className="table-wrapper full-width">
                    <h3>Recent Bookings</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Provider</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Job Value</th>
                                <th>Commission</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.length > 0 ? recentBookings.map((b, i) => {
                                const jobValue = (b.pricePerHour || 0) * (b.providerCount || 1);
                                return (
                                    <tr key={i}>
                                        <td>{b.username || b.customer?.name || 'N/A'}</td>
                                        <td>{b.service?.name || 'N/A'}</td>
                                        <td>{b.provider?.name || 'Unassigned'}</td>
                                        <td>{displayStatus(b.status)}</td>
                                        <td>{b.appointmentDate ? new Date(b.appointmentDate).toLocaleDateString() : 'N/A'}</td>
                                        <td>Rs. {jobValue}</td>
                                        <td>Rs. {b.commissionAmount || 0}</td>
                                        <td>
                                            <button
                                                className="action-btn"
                                                onClick={() => navigate(`/bookings/detail/${b._id}`)}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="8">No recent bookings</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>


                <div className="table-wrapper half-width">
                    <h3>Recent Customers</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Registered</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentUsers.length > 0 ? recentUsers.map((u, i) => (
                                <tr key={i}>
                                    <td>{u.name || 'N/A'}</td>
                                    <td>{u.email || 'N/A'}</td>
                                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3">No recent users</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
