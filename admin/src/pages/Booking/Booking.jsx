import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./booking.css";

const BookingList = ({ url }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/booking/list`, {
                headers: { atoken: token },
            });

            if (res.data.success) {
                setBookings(res.data.data);
            } else {
                toast.error("Failed to fetch bookings");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error while fetching bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (loading) return <p>Loading bookings...</p>;

    return (
        <div className="list-container">
            <p className="list-title">All Bookings</p>
            <div className="list-table">
                {bookings.map((booking) => (
                    <div
                        key={booking._id}
                        className="list-table-format"
                        onClick={() => navigate(`/bookings/detail/${booking._id}`)}
                    >
                        <img
                            src={
                                booking.service?.image
                                    ? `${url}${booking.service.image}`
                                    : "/default-service.png"
                            }
                            alt={booking.service?.name}
                            className="service-image"
                        />

                        <p><strong>Service:</strong> {booking.service?.name}</p>
                        <p><strong>Status:</strong> {booking.status}</p>
                        <p><strong>Date:</strong> {new Date(booking.appointmentDate).toLocaleDateString()}</p>

                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookingList;
