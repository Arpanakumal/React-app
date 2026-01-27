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
            const res = await axios.get(`${url}/api/User/list`); // Make sure backend has this route
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
            await axios.delete(`${url}/api/User/delete/${id}`);
            toast.success('Customer deleted');
            fetchCustomers();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete customer');
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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((c) => (
                                <tr key={c._id}>
                                    <td>{c.name}</td>
                                    <td>{c.email}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => deleteCustomer(c._id)}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3">No customers found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Customer;
