import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./details.css";

const BookingDetail = ({ url }) => {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBooking = async () => {
        try {
            const token = localStorage.getItem("pToken");
            if (!token) throw new Error("Provider not logged in");

            const res = await axios.get(`${url}/api/booking/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                setBooking(res.data.data);
            } else {
                toast.error(res.data.message || "Failed to fetch booking");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooking();
    }, [id]);

    if (loading) return <p>Loading booking details...</p>;
    if (!booking) return <p>No booking found.</p>;

    // Helper to format providers
    const providerNames =
        booking.providers && booking.providers.length > 0
            ? booking.providers.map((p) => p.name).join(", ")
            : "Not assigned";

    return (
        <div className="detail-container">
            <h2>Booking Details</h2>

            <div className="section">
                <h3>Customer Info</h3>
                <p><strong>Name:</strong> {booking.customer?.name || booking.username}</p>
                <p><strong>Email:</strong> {booking.customer?.email || "-"}</p>
                <p><strong>Phone:</strong> {booking.customer?.phone || booking.phone || "-"}</p>
            </div>

            <div className="section">
                <h3>Service Info</h3>
                <p><strong>Service:</strong> {booking.service?.name || "N/A"}</p>
                <p><strong>Provider(s):</strong> {providerNames}</p>
                <p><strong>Provider Count:</strong> {booking.providerCount || 1}</p>
            </div>

            <div className="section">
                <h3>Appointment Details</h3>
                <p><strong>Date:</strong> {new Date(booking.appointmentStart).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(booking.appointmentStart).toLocaleTimeString()}</p>
                <p>
                    <strong>Address:</strong>{" "}
                    {booking.address?.street || "-"}, {booking.address?.city || "-"}, {booking.address?.state || "-"}, {booking.address?.zip || "-"}, {booking.address?.country || "-"}
                </p>
                <p><strong>Notes:</strong> {booking.notes || "None"}</p>
            </div>

            <div className="section">
                <h3>Pricing</h3>
                <p><strong>Price per Hour:</strong> Rs. {booking.pricePerHour}</p>
                <p><strong>Final Price:</strong> Rs. {booking.finalPrice}</p>
                <p><strong>Commission %:</strong> {booking.commissionPercent}</p>
                <p><strong>Commission Amount:</strong> Rs. {booking.commissionAmount}</p>
                <p><strong>Provider Earning:</strong> Rs. {booking.providerEarning}</p>
            </div>

            <div className="section">
                <h3>Status</h3>
                <p><strong>Booking Status:</strong> {booking.status}</p>
                <p><strong>Created At:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                <p><strong>Updated At:</strong> {new Date(booking.updatedAt).toLocaleString()}</p>
                <p><strong>Hours Worked:</strong> {booking.hoursWorked || 0}</p>
            </div>
        </div>
    );
};

export default BookingDetail;