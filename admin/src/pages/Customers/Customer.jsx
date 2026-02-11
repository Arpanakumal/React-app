import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './customers.css';

const Customer = ({ url }) => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Fetch all customers
    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${url}/api/user/list`, {
                headers: { atoken: token }
            });
            setCustomers(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Delete customer
    const deleteCustomer = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${url}/api/User/delete/${id}`, { headers: { atoken: token } });
            toast.success('Customer deleted');
            fetchCustomers();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete customer');
        }
    };

    // Toggle active/inactive
    const toggleStatus = async (customer) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.patch(
                `${url}/api/User/${customer._id}/toggle`,
                {},
                { headers: { atoken: token } }
            );
            if (res.data.success) {
                toast.success(res.data.message);
                setCustomers((prev) =>
                    prev.map((c) =>
                        c._id === customer._id ? { ...c, isActive: res.data.isActive } : c
                    )
                );
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error updating status');
        }
    };

    // Filtered customers by search
    const filteredCustomers = customers.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-customers-page">
            <h2>Customer Management</h2>

            <div className="customer-search">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {loading ? (
                <p>Loading customers...</p>
            ) : (
                <table className="customers-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Registered At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => (
                                <tr key={c._id}>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>{c.isActive ? "Active" : "Inactive"}</td>
                                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className={`status-btn ${c.isActive ? 'deactivate' : 'activate'}`}
                                            onClick={() => toggleStatus(c)}
                                        >
                                            {c.isActive ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button className="delete-btn" onClick={() => deleteCustomer(c._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5">No customers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Customer;
