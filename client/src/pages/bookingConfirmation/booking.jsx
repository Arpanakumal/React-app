import React, { useContext } from "react";
import './booking.css';
import { StoreContext } from '../../context/StoreContext';
import { provider_list } from '../../assets/providers';


const Booking = () => {
    const { selectedServices, Service_list, getTotalAmount } = useContext(StoreContext);

    return (
        <form className='confirm-booking'>
            <div className="confirm-booking-left">
                <p className='title'>Booking Information</p>

                <div className="multi-fields">
                    <input type="text" placeholder='First name' required />
                    <input type="text" placeholder='Last name' required />
                </div>

                <input type="email" placeholder='Email address' required />
                <input type="text" placeholder='Street' required />

                <div className="multi-fields">
                    <input type="text" placeholder='City' required />
                    <input type="text" placeholder='State' required />
                </div>

                <div className="multi-fields">
                    <input type="text" placeholder='Zip Code' required />
                    <input type="text" placeholder='Country' required />
                </div>

                <input type="tel" placeholder='Phone' required />

                <div className="multi-fields">
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" name="date" required />

                    <label htmlFor="time">Time:</label>
                    <input type="time" id="time" name="time" required />
                </div>

                <textarea
                    placeholder="Special instructions or notes"
                    rows={4}
                    maxLength={500}
                ></textarea>
            </div>

            <div className="confirm-booking-right">
                <h3>Appointment Summary</h3>

                {Object.entries(selectedServices).length === 0 ? (
                    <p>No services selected.</p>
                ) : (
                    Object.entries(selectedServices).map(([serviceId, data]) => {
                        const service = Service_list.find(s => s._id === serviceId);
                        if (!service) return null;

                        return (
                            <div key={serviceId} className="summary-item">
                                <p><strong>Service:</strong> {service.name}</p>
                                <p><strong>Providers:</strong> {data.providers}</p>
                                <p><strong>Provider Name:</strong> {data.provider?.name}</p>
                                <p><strong>Phone:</strong> {data.provider?.phone}</p>
                                <p><strong>Email:</strong> {data.provider?.email}</p>
                                <p><strong>Price:</strong> Rs.{(service.price * data.providers).toFixed(2)}</p>
                                <hr />
                            </div>
                        );
                    })
                )}

                {Object.entries(selectedServices).length > 0 && (
                    <p><strong>Total:</strong> Rs.{getTotalAmount().toFixed(2)}</p>
                )}

                <button>Confirm Booking</button>
            </div>

        </form>
    );
};

export default Booking;
