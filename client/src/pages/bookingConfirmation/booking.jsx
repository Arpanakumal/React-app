import React, { useContext, useState } from "react";
import './booking.css';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from "react-router-dom";

const Booking = () => {
    const { selectedServices, Service_list, getTotalAmount, token, getAuthAxios } = useContext(StoreContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        phone: '',
        date: '',
        time: '',
        notes: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (!token) {
            alert("You must be logged in to book a service.");
            return;
        }

        if (Object.keys(selectedServices).length === 0) {
            alert("No services selected.");
            return;
        }

        try {
            const authAxios = getAuthAxios();

            // Create bookings for each selected service
            const bookingPromises = Object.entries(selectedServices).map(([serviceId, data]) => {
                const username = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
                return authAxios.post("/booking/create", {
                    serviceId,
                    providerCount: Number(data.providers) || 1,
                    username,
                    phone: formData.phone.trim(),
                    appointmentDate: formData.date,
                    appointmentTime: formData.time,
                    address: {
                        street: formData.street || "",
                        city: formData.city || "",
                        state: formData.state || "",
                        zip: formData.zip || "",
                        country: formData.country || ""
                    },
                    notes: formData.notes?.trim() || ""
                });
            });

            const responses = await Promise.all(bookingPromises);

            // Check if all bookings succeeded
            const success = responses.every(res => res.data.success);
            if (success) {
                alert("Booking(s) created successfully!");
                navigate("/my-bookings");
            } else {
                const failedMessages = responses
                    .filter(res => !res.data.success)
                    .map(res => res.data.message);
                alert(`Some bookings failed: ${failedMessages.join(", ")}`);
            }

        } catch (error) {
            console.error("Booking error:", error?.response?.data || error.message);
            const message = error?.response?.data?.message || error.message;
            alert(`Booking error: ${message}`);
        }
    };

    return (
        <form className='confirm-booking' onSubmit={handleBooking}>
            <div className="confirm-booking-left">
                <p className='title'>Booking Information</p>

                <div className="multi-fields">
                    <input
                        type="text"
                        name="firstName"
                        placeholder='First name'
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder='Last name'
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </div>

                <input
                    type="email"
                    name="email"
                    placeholder='Email address'
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="text"
                    name="street"
                    placeholder='Street'
                    value={formData.street}
                    onChange={handleChange}
                />

                <div className="multi-fields">
                    <input type="text" name="city" placeholder='City' value={formData.city} onChange={handleChange} />
                    <input type="text" name="state" placeholder='State' value={formData.state} onChange={handleChange} />
                </div>

                <div className="multi-fields">
                    <input type="text" name="zip" placeholder="Zip Code" value={formData.zip} onChange={handleChange} />
                    <input type="text" name="country" placeholder='Country' value={formData.country} onChange={handleChange} />
                </div>

                <input
                    type="tel"
                    name="phone"
                    placeholder='Phone'
                    required
                    value={formData.phone}
                    onChange={handleChange}
                />

                <div className="multi-fields">
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" name="date" required value={formData.date} onChange={handleChange} />

                    <label htmlFor="time">Time:</label>
                    <input type="time" id="time" name="time" required value={formData.time} onChange={handleChange} />
                </div>

                <textarea
                    name="notes"
                    placeholder="Special instructions or notes"
                    rows={4}
                    maxLength={500}
                    value={formData.notes}
                    onChange={handleChange}
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

                        const price = Number(service.price_info || service.price || 0) * data.providers;

                        return (
                            <div key={serviceId} className="summary-item">
                                <p><strong>Service:</strong> {service.name}</p>
                                <p><strong>Providers:</strong> {data.providers}</p>
                                <p><strong>Price:</strong> Rs.{price.toFixed(2)}</p>
                                <hr />
                            </div>
                        );
                    })
                )}

                {Object.entries(selectedServices).length > 0 && (
                    <p><strong>Total:</strong> Rs.{getTotalAmount().toFixed(2)}</p>
                )}

                <button type="submit">Confirm Booking</button>
            </div>
        </form>
    );
};

export default Booking;