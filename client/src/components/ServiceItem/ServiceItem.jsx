import React from 'react';
import './ServiceItem.css';
import { useNavigate } from 'react-router-dom';

const ServiceItem = ({ id, image, name }) => {
    const navigate = useNavigate();

    return (
        <div
            className="service-item-image-only"
            onClick={() => navigate(`/service/${id}`)}
        >
            <img src={image} alt={name} />
        </div>
    );
};

export default ServiceItem;
