import React from 'react';
import './ServiceItem.css';
import { useNavigate } from 'react-router-dom';

const ServiceItem = ({ id, image, name }) => {
    const navigate = useNavigate();

    const imageUrl =
        image?.startsWith("http")
            ? image
            : `http://localhost:3001${image}`;

    return (
        <div
            className="service-item-image-only"
            onClick={() => navigate(`/service/${id}`)}
        >
            <img
                src={imageUrl}
                alt={name}
            />
        </div>
    );
};

export default ServiceItem;