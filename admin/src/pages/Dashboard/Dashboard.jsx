import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = ({ url }) => {

    const [metrics, setMetrics] = useState({
        totalBookings: 0,
        completedJobs: 0,
        activeProviders: 0,
        pendingCommission: 0
    });

    const [recentBookings, setRecentBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        fetchDashboardData();
        fetchRecentBookings();
        fetchRecentUsers();
    }, []);

    // Fetch KPI metrics
    const fetchDashboardData = async () => {
        try {
            const resBookings = await axios.get(`${url}/api/Booking/list`);
            const resProviders = await axios.get(`${url}/api/Provider/list`);

            const bookings = resBookings.data?.data || [];
            const providers = resProviders.data?.data || [];

            const completedJobs = bookings.filter(b => b.status === 'completed');
            const pendingCommission = completedJobs.reduce(
                (sum, b) => sum + (b.commissionAmount || 0),
                0
            );

            setMetrics({
                totalBookings: bookings.length,
                completedJobs: completedJobs.length,
                activeProviders: providers.length,
                pendingCommission
            });

        } catch (error) {
            toast.error("Error fetching dashboard data");
            console.error(error);
        }
    };

    // Fetch recent 5 bookings
    const fetchRecentBookings = async () => {
        try {
            const res = await axios.get(`${url}/api/Booking/list?limit=5`);
            setRecentBookings(res.data?.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    // Fetch recent 5 customers
    const fetchRecentUsers = async () => {
        try {
            const res = await axios.get(`${url}/api/Customer/list?limit=5`);
            setRecentUsers(res.data?.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>

            <div className="kpi-cards">
                <div className="card">
                    <h3>₹ {metrics.pendingCommission}</h3>
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

            {/* TABLES */}
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
                            {recentBookings.length > 0 ? recentBookings.map((b, i) => (
                                <tr key={i}>
                                    <td>{b.customerName || 'N/A'}</td>
                                    <td>{b.serviceName || 'N/A'}</td>
                                    <td>{b.providerName || 'Unassigned'}</td>
                                    <td>{b.status || 'N/A'}</td>
                                    <td>{b.date ? new Date(b.date).toLocaleDateString() : 'N/A'}</td>
                                    <td>₹ {b.amount || 0}</td>
                                    <td>₹ {b.commissionAmount || 0}</td>
                                    <td>
                                        <button className="action-btn">
                                            View
                                        </button>
                                    </td>
                                </tr>
                            )) : (
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

            <div className="charts-section">
                <div className="chart-placeholder">
                    <h3>Booking Trends</h3>
                    <p>Completed vs Cancelled</p>
                </div>

                <div className="chart-placeholder">
                    <h3>Service Categories</h3>
                    <p>Category-wise demand</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
