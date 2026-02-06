import React, { useEffect, useState } from 'react';
import './list.css'; // renamed CSS file for clarity
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({ url }) => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/Service/list`);
            if (response.data.success) {
                setServices(response.data.data);
            } else {
                toast.error("Error fetching services");
            }
        } catch (error) {
            toast.error("Server error");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const removeService = async (serviceId) => {
        try {
            const response = await axios.post(`${url}/api/Service/remove`, { id: serviceId });
            if (response.data.success) {
                toast.success("Service Removed");
                fetchServices(); // refresh list
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Delete failed");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    if (loading) return <p>Loading services...</p>;

    return (
        <div className="service-list-container">
            <p className="service-list-title">All Services</p>
            <div className="service-list-table">
                <div className="service-list-table-header">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price Info</b>
                    <b>Action</b>
                </div>

                {services.map((service) => (
                    <div key={service._id} className="service-list-row">
                        <img src={`${url}${service.image}`} alt={service.name} />

                        <p>{service.name}</p>
                        <p>{service.category}</p>
                        <p>{service.price_info}</p>
                        <div className="service-list-actions">
                            <button
                                onClick={() => navigate(`/services/update/${service._id}`)}
                                className="edit-btn"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => removeService(service._id)}
                                className="delete-btn"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default List;
