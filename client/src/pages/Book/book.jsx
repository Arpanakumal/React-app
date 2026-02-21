import React, { useContext } from 'react';
import './book.css';
import { StoreContext } from '../../context/StoreContext';
import { cross } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Book = () => {

    const {
        selectedServices,
        Service_list,
        removeService,
        updateProviders,
        getTotalAmount,
        token,
        url
    } = useContext(StoreContext);

    const serviceEntries = Object.entries(selectedServices);
    const navigate = useNavigate();

    const handleConfirm = () => {
        if (!token) {
            alert("Please login first");
            return;
        }

        navigate('/booking');
    };

    return (
        <div className="book">
            <h2>Your Appointment</h2>

            <div className="book-items">
                <div className="book-items-title">
                    <p>Service</p>
                    <p>Image</p>
                    <p>Providers</p>
                    <p>Price Info</p>
                    <p>Total</p>
                    <p>Remove</p>
                </div>

                {serviceEntries.length === 0 ? (
                    <p className="empty-cart">No services selected.</p>
                ) : (
                    serviceEntries.map(([serviceId, data]) => {
                        const service = Service_list.find(s => s._id === serviceId);
                        if (!service) return null;

                        return (
                            <div key={serviceId} className="book-item">
                                <p>{service.name}</p>

                                <div className="book-item-image">
                                    <img
                                        src={`${url.replace("/api", "")}${service.image}`}
                                        alt={service.name}
                                    />
                                </div>

                                <div className="providers-input-container">
                                    <label htmlFor={`providers-${serviceId}`}>
                                        Providers:
                                    </label>
                                    <input
                                        id={`providers-${serviceId}`}
                                        type="number"
                                        min={1}
                                        value={data.providers}
                                        onChange={(e) =>
                                            updateProviders(serviceId, parseInt(e.target.value))
                                        }
                                    />
                                </div>

                                <p>{service.price_info}</p>

                                <p>
                                    Rs.
                                    {(Number(service.price_info) * data.providers).toFixed(2)}
                                </p>

                                <button
                                    className="remove-btn"
                                    onClick={() => removeService(serviceId)}
                                >
                                    <img src={cross} alt="Remove" className="cross-icon" />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <hr />

            {serviceEntries.length > 0 && (
                <div className="book-footer">
                    <div className="book-total">
                        <h3>Total: Rs.{getTotalAmount().toFixed(2)}</h3>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="confirm-btn"
                    >
                        Confirm Appointment
                    </button>
                </div>
            )}
        </div>
    );
};

export default Book;