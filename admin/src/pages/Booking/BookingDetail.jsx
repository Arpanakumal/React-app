import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./bookingDetail.css";

const BookingDetail = ({ url }) => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBooking = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [id]);

    if (!booking) return <p className="loading-text">Loading booking details...</p>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <img
                    src={booking.service?.image ? `${url}${booking.service.image}` : "/default-service.png"}
                    alt={booking.service?.name || "Service"}
                    className="service-image"
                />
                <h2>{booking.service?.name || "No Name"}</h2>
            </div>

            <div className="detail-info">
                <p><strong>Customer:</strong> {booking.username || booking.customer?.name}</p>
                <p><strong>Email:</strong> {booking.customer?.email || "-"}</p>
                <p><strong>Phone:</strong> {booking.customer?.phone || "-"}</p>
                <p><strong>Provider:</strong> {booking.provider?.name || "Not assigned"}</p>
                <p><strong>Provider Count:</strong> {booking.providerCount || 1}</p>
                <p>
                    <strong>Appointment:</strong> {new Date(booking.appointmentDate).toLocaleDateString()} at {booking.appointmentTime}
                </p>
                <p>
                    <strong>Address:</strong> {booking.address?.street || "-"}, {booking.address?.city || "-"}
                </p>
                <p><strong>Notes:</strong> {booking.notes || "None"}</p>
                <p><strong>Price/Hour:</strong> Rs. {booking.pricePerHour}</p>
                <p><strong>Total Price:</strong> Rs. {booking.finalPrice}</p>
                <p><strong>Commission %:</strong> {booking.commissionPercent}</p>
                <p><strong>Commission Amount:</strong> Rs. {booking.commissionAmount}</p>
                <p><strong>Booking Created:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                {/* <p><strong>Service Started:</strong> {booking.startedAt ? new Date(booking.startedAt).toLocaleString() : "Not started"}</p>
                <p><strong>Service Ended:</strong> {booking.endedAt ? new Date(booking.endedAt).toLocaleString() : "Not ended"}</p> */}
                <p><strong>Provider Earning:</strong> Rs. {booking.providerEarning}</p>
                <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
            </div>
        </div>
    );
};

export default BookingDetail;
