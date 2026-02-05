import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./bookingDetail.css";

const BookingDetail = ({ url }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBooking = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/booking/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });


            if (res.data.success) {
                setBooking(res.data.data);
            } else {
                toast.error("Failed to fetch booking details");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error while fetching booking");
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [id]);

    const updateStatus = async (newStatus) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            setLoading(true);
            const res = await axios.put(
                `${url}/api/booking/update/${id}`,
                { status: newStatus },
                { headers: { atoken: token } }
            );

            if (res.data.success) {
                toast.success("Status updated");
                setBooking((prev) => ({ ...prev, status: newStatus }));
            } else {
                toast.error("Failed to update status");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error while updating status");
        } finally {
            setLoading(false);
        }
    };

    if (!booking)
        return <p className="loading-text">Loading booking details...</p>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <img
                    src={
                        booking.service?.image
                            ? `${url}${booking.service.image}`
                            : "/default-service.png"
                    }
                    alt={booking.service?.name}
                    className="service-image"
                />
                <h2>{booking.service?.name}</h2>
            </div>

            <div className="detail-info">
                <p><strong>Customer Name:</strong> {booking.username || booking.customer?.name}</p>
                <p><strong>Email:</strong> {booking.customer?.email}</p>
                <p><strong>Phone:</strong> {booking.customer?.phone}</p>
                <p><strong>Provider:</strong> {booking.provider?.name || "Not assigned"}</p>
                <p><strong>Appointment:</strong> {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}</p>
                <p><strong>Address:</strong> {booking.address?.street}, {booking.address?.city}</p>
                <p><strong>Notes:</strong> {booking.notes || "None"}</p>
                <p><strong>Price/Hour:</strong> Rs. {booking.pricePerHour}</p>
                <p><strong>Commission %:</strong> {booking.commissionPercent}</p>
                <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
            </div>


        </div>
    );
};

export default BookingDetail;
