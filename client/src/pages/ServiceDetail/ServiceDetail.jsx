import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import './ServiceDetail.css';

const ServiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { Service_list, addService } = useContext(StoreContext);

    const service = Service_list.find(item => item._id === id);

    if (!service) return <p>Service not found</p>;

    const handleBooking = () => {
        addService(service._id);
        navigate('/book');
    };

    return (
        <div className="service-detail">
            <img src={service.image} alt={service.name} />

            <div className="service-detail-info">
                <h2>{service.name}</h2>
                <p>{service.description}</p>
                <p><strong>{service.price_info}</strong></p>

                <div className="rating">
                    {[1, 2, 3, 4, 5].map(star => (
                        <span key={star}>
                            {star <= Math.round(service.rating) ? "⭐" : "☆"}
                        </span>
                    ))}
                </div>

                <button onClick={handleBooking}>
                    Continue to Booking
                </button>
            </div>
        </div>
    );
};

export default ServiceDetail;
