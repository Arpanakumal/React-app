import React, { useContext } from 'react'
import './ServiceItem.css'
import { StoreContext } from '../../context/StoreContext'
import { useNavigate } from 'react-router-dom'

const ServiceItem = ({ id, name, price_info, description, image, rating }) => {
    const { setSelectedService } = useContext(StoreContext);
    const { addService } = useContext(StoreContext);
    const navigate = useNavigate();

    const handleBookNow = () => {
        addService(id); 
        navigate('/book'); 
    };

    return (
        <div className='service-item'>
            <div className="service-item-img-contaier">
                <img className='service-item-img' src={image} alt={name} />
            </div>

            <div className="service-item-info">
                <div className="rating">
                    <p className="service-name">{name}</p>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star}>
                            {star <= Math.round(rating) ? "⭐" : "☆"}
                        </span>
                    ))}
                </div>
            </div>

            <p className="service-item-desc">{description}</p>
            <p className="service-item-price">{price_info}</p>

            <button className="book-now-btn" onClick={handleBookNow}>
                Book Appointment
            </button>
        </div>
    )
}

export default ServiceItem
