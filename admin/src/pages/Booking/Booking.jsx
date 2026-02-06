import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./booking.css";

const BookingList = ({ url }) => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const perPage = 8;

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/booking/list`, {
                headers: { Authorization: `Bearer ${token}` },
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


    const filteredBookings = bookings.filter(b =>
        (search ? b.service?.name.toLowerCase().includes(search.toLowerCase()) : true) &&
        (statusFilter ? b.status === statusFilter : true)
    );

    const indexOfLast = currentPage * perPage;
    const indexOfFirst = indexOfLast - perPage;
    const currentBookings = filteredBookings.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredBookings.length / perPage);


    const displayStatus = (status) => {
        switch (status) {
            case "pending": return "Pending";
            case "confirmed": return "In Progress";
            case "completed": return "Completed";
            case "cancelled": return "Cancelled";
            default: return status;
        }
    }

    if (loading) return <p>Loading bookings...</p>;

    return (
        <div className="list-container">
            <p className="list-title">All Bookings</p>

            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by service..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            <div className="list-table">
                {currentBookings.map(b => (
                    <div
                        key={b._id}
                        className="list-table-format"
                        style={{ cursor: "pointer" }}
                        onClick={() => navigate(`/bookings/detail/${b._id}`)}
                    >
                        <img
                            src={b.service?.image ? `${url}${b.service.image}` : "/default-service.png"}
                            alt={b.service?.name || "Service"}
                            className="service-image"
                        />
                        <p><strong>{b.service?.name || "No Name"}</strong></p>
                        <p><strong>Customer:</strong> {b.username || b.customer?.name}</p>
                        <p><strong>Status:</strong> {displayStatus(b.status)}</p>
                        <p><strong>Date:</strong> {new Date(b.appointmentDate).toLocaleDateString()}</p>


                    </div>
                ))}
            </div>

            <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={currentPage === i + 1 ? "active" : ""}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BookingList;
