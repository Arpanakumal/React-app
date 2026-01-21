import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminDashboard = ({url}) => {



    const [metrics, setMetrics] = useState({
        totalServices: 0,
        totalBookings: 0,
        totalCustomers: 0,
        totalProviders: 0
    });

    const [recentBookings, setRecentBookings] = useState([]);
    const [recentUsers, setRecentUsers] = useState([]);

    useEffect(() => {
        fetchMetrics();
        fetchRecentBookings();
        fetchRecentUsers();
    }, []);

    const fetchMetrics = async () => {
        try {
            const resServices = await axios.get(`${url}/api/Service/list`);
            const resBookings = await axios.get(`${url}/api/Booking/list`);
            const resCustomers = await axios.get(`${url}/api/Customer/list`);
            const resProviders = await axios.get(`${url}/api/Provider/list`);

            setMetrics({
                totalServices: resServices.data.data.length,
                totalBookings: resBookings.data.data.length,
                totalCustomers: resCustomers.data.data.length,
                totalProviders: resProviders.data.data.length
            });
        } catch (error) {
            toast.error("Error fetching metrics");
            console.error(error);
        }
    };

    const fetchRecentBookings = async () => {
        try {
            const res = await axios.get(`${url}/api/Booking/list?limit=5`);
            setRecentBookings(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRecentUsers = async () => {
        try {
            const res = await axios.get(`${url}/api/Customer/list?limit=5`);
            setRecentUsers(res.data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Admin Dashboard</h2>


            <div className="kpi-cards">
                <div className="card">
                    <h3>{metrics.totalServices}</h3>
                    <p>Total Services</p>
                </div>
                <div className="card">
                    <h3>{metrics.totalBookings}</h3>
                    <p>Total Bookings</p>
                </div>
                <div className="card">
                    <h3>{metrics.totalCustomers}</h3>
                    <p>Active Customers</p>
                </div>
                <div className="card">
                    <h3>{metrics.totalProviders}</h3>
                    <p>Active Providers</p>
                </div>
            </div>


            <div className="tables-section">
                <div className="table-wrapper">
                    <h3>Recent Bookings</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Service</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentBookings.map((b, i) => (
                                <tr key={i}>
                                    <td>{b.customerName}</td>
                                    <td>{b.serviceName}</td>
                                    <td>{b.status}</td>
                                    <td>{new Date(b.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-wrapper">
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
                            {recentUsers.map((u, i) => (
                                <tr key={i}>
                                    <td>{u.name}</td>
                                    <td>{u.email}</td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="charts-section">
                <div className="chart-placeholder">
                    <h3>Booking Trends</h3>
                    <p>Chart will appear here</p>
                </div>
                <div className="chart-placeholder">
                    <h3>Service Categories</h3>
                    <p>Chart will appear here</p>
                </div>
            </div>

        </div>
    );
};

export default AdminDashboard;
