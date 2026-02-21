import React, { useState, useEffect } from 'react';
import './edit.css';
import { upload } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const EditProvider = ({ url }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const API_URL = `${url}/api`;

    const [image, setImage] = useState(null);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [defaultCommission, setDefaultCommission] = useState(10);
    const [data, setData] = useState({ name: '', phone: '', email: '' });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    if (!token) {
        toast.error("Admin not logged in!");
    }


    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get(`${API_URL}/Service/list`, {
                    headers: { atoken: token },
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

    // Fetch provider details
    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const res = await axios.get(`${API_URL}/provider/${id}`, {
                    headers: { atoken: token },
                });
                if (res.data.success) {
                    const prov = res.data.provider; // <-- use provider, not data
                    setData({ name: prov.name, phone: prov.phone, email: prov.email });
                    setDefaultCommission(prov.defaultCommissionPercent || 10);
                    setSelectedServices(prov.servicesOffered.map(s => s._id));
                    setImage(prov.image ? `${url}${prov.image}` : null);
                } else {
                    toast.error("Failed to fetch provider data");
                }
            } catch (err) {
                console.error(err);
                toast.error("Error fetching provider");
            } finally {
                setLoading(false);
            }
        };
        fetchProvider();
    }, [id, token]);

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

        if (!data.name || !data.email) {
            toast.error('Name and email are required');
            return;
        }

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('phone', data.phone);
        formData.append('email', data.email);
        formData.append('defaultCommissionPercent', defaultCommission);
        formData.append('servicesOffered', JSON.stringify(selectedServices));
        if (image && image instanceof File) formData.append('image', image);

        try {
            const res = await axios.put(`${API_URL}/provider/${id}`, formData, {
                headers: { atoken: token },
            });
            if (res.data.success) {
                toast.success("Provider updated successfully");
                navigate('/providers'); // back to list
            } else {
                toast.error(res.data.message || "Failed to update provider");
            }
        } catch (err) {
            console.error(err.response?.data || err);
            toast.error("Error updating provider");
        }
    };

    if (loading) return <p>Loading provider details...</p>;

    return (
        <div className="service-page">
            <div className="add">
                <form className="flex-col" onSubmit={onSubmitHandler}>
                    <div className="add-img-upload flex-col">
                        <p>Upload Image</p>
                        <label htmlFor="image">
                            <img
                                src={image ? (image instanceof File ? URL.createObjectURL(image) : image) : upload}
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

                    <div className="action-buttons flex-col">
                        <button type="submit" className="add-btn">Update Provider</button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProvider;
