import React, { useState, useEffect } from 'react';
import './provider.css';
import { upload } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Providers = () => {
    const API_URL = "http://localhost:3001/api";

    const [image, setImage] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [defaultCommission, setDefaultCommission] = useState(10);
    const [data, setData] = useState({ name: '', phone: '', email: '' });

    // Get token from localStorage or URL
    useEffect(() => {
        const urlToken = new URLSearchParams(window.location.search).get("token");
        const storedToken = localStorage.getItem("token");

        if (!storedToken && urlToken) {
            localStorage.setItem("token", urlToken);
        }
    }, []);

    const token = localStorage.getItem("token");

    // Fetch services
    useEffect(() => {
        const fetchServices = async () => {
            if (!token) {
                toast.error("Provider not logged in!");
                return;
            }

            try {
                const res = await axios.get(`${API_URL}/Service/list`, {
                    headers: { Authorization: `Bearer ${token}` } // <-- fixed header
                });

                if (res.data.success) setServices(res.data.data);
                else toast.error(res.data.message);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load services");
            }
        };

        fetchServices();
    }, [token]);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const onServiceChange = (e) => {
        const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
        setSelectedServices(options);
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!data.name || !data.email || !data.phone) {
            toast.error('Name, phone, and email are required');
            return;
        }

        if (!token) {
            toast.error("Provider not logged in!");
            return;
        }

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('defaultCommissionPercent', defaultCommission);
        formData.append('servicesOffered', JSON.stringify(selectedServices));
        if (image) formData.append('image', image);

        try {
            const res = await axios.post(`${API_URL}/provider/add`, formData, {
                headers: { Authorization: `Bearer ${token}` } // <-- fixed header
            });

            if (res.data.success) {
                setData({ name: '', phone: '', email: '' });
                setSelectedServices([]);
                setImage(null);
                setDefaultCommission(10);
                toast.success(`Provider added. Password: ${res.data.password}`);
            } else {
                toast.error(res.data.message || "Failed to add provider");
            }
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error('Error adding provider');
        }
    };

    return (
        <div className="service-page">
            <div className="add">
                <form className="flex-col" onSubmit={onSubmitHandler}>
                    <div className="add-img-upload flex-col">
                        <p>Upload Image</p>
                        <label htmlFor="image">
                            <img
                                src={image ? URL.createObjectURL(image) : upload}
                                alt="Upload Preview"
                                style={{ width: 150, height: 150, objectFit: 'cover', cursor: 'pointer' }}
                            />
                        </label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={e => setImage(e.target.files[0])}
                        />
                    </div>

                    <div className="add-service-name flex-col">
                        <p>Provider Name</p>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter provider name"
                            value={data.name}
                            onChange={onChangeHandler}
                            required
                        />
                    </div>

                    <div className="add-service-name flex-col">
                        <p>Phone</p>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Enter phone number"
                            value={data.phone}
                            onChange={onChangeHandler}
                            required
                        />
                    </div>

                    <div className="add-service-name flex-col">
                        <p>Email</p>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter email"
                            value={data.email}
                            onChange={onChangeHandler}
                            required
                        />
                    </div>

                    <div className="add-service-name flex-col">
                        <p>Default Commission %</p>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={defaultCommission}
                            onChange={e => setDefaultCommission(e.target.value)}
                            required
                        />
                    </div>

                    <div className="add-category flex-col">
                        <p>Services Offered</p>
                        <select multiple value={selectedServices} onChange={onServiceChange}>
                            {services.map(service => (
                                <option key={service._id} value={service._id}>
                                    {service.name} ({service.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="add-btn">Add Provider</button>
                </form>
            </div>
        </div>
    );
};

export default Providers;
