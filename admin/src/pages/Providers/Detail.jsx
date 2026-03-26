import React, { useEffect, useState } from "react";
import "./detail.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Detail = ({ url }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
    const [ratings, setRatings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return toast.error("Admin not logged in");


                const res = await axios.get(`${url}/api/provider/${id}`, {
                    headers: { atoken: token },
                });

                if (res.data.success) {
                    setProvider(res.data.provider);
                } else {
                    toast.error("Failed to fetch provider details");
                }


                const ratingRes = await axios.get(`${url}/api/provider/${id}/ratings`, {
                    headers: { atoken: token },
                });
                if (ratingRes.data.success) {
                    setRatings(ratingRes.data.ratings);
                }
            } catch (err) {
                console.error("AxiosError:", err);
                toast.error("Server error while fetching provider");
            }
        };

        fetchProvider();
    }, [id, url]);

    const toggleStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            setLoading(true);
            const res = await axios.patch(
                `${url}/api/provider/${id}/toggle`,
                {},
                { headers: { atoken: token } }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setProvider(prev => ({ ...prev, available: res.data.available }));
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error updating provider status");
        } finally {
            setLoading(false);
        }
    };

    if (!provider) return <p className="loading-text">Loading provider details...</p>;

    const averageRating =
        ratings.length > 0
            ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
            : 0;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <img
                    src={provider.image ? `${url}${provider.image}` : "/default-avatar.png"}
                    alt={provider.name}
                />
                <h2>{provider.name}</h2>
            </div>

            <div className="detail-info">
                <p><span>Phone:</span> {provider.phone || "N/A"}</p>
                <p><span>Email:</span> {provider.email}</p>
                <p>
                    <span>Services:</span>{" "}
                    {provider.servicesOffered.map(s => s.name).join(", ")}
                </p>
                <p>
                    <span>Status:</span>{" "}
                    <span className={`status ${provider.available ? "available" : "unavailable"}`}>
                        {provider.available ? "Available" : "Not Available"}
                    </span>
                </p>
                <p><span>Joined At:</span> {new Date(provider.createdAt).toLocaleDateString()}</p>

                {provider.availability && (
                    <div className="availability-section">
                        <h3>Availability</h3>
                        <p>
                            <span>Working Days:</span>{" "}
                            {provider.availability.workingDays?.length
                                ? provider.availability.workingDays.join(", ")
                                : "Not set"}
                        </p>
                        <p>
                            <span>Working Hours:</span>{" "}
                            {provider.availability.startTime && provider.availability.endTime
                                ? `${provider.availability.startTime} - ${provider.availability.endTime}`
                                : "Not set"}
                        </p>
                        <p>
                            <span>Currently Available:</span>{" "}
                            <span
                                className={`status ${provider.availability.isAvailable ? "available" : "unavailable"}`}
                            >
                                {provider.availability.isAvailable ? "Yes" : "No"}
                            </span>
                        </p>
                    </div>
                )}



                <div className="ratings-section">
                    <h3>Ratings & Reviews</h3>
                    <p>
                        <strong>Average Rating:</strong> {averageRating} ⭐ ({ratings.length} review{ratings.length !== 1 ? "s" : ""})
                    </p>
                    {ratings.length > 0 ? (
                        <ul className="reviews-list">
                            {ratings.map((r, index) => (
                                <li key={index}>
                                    <strong>{r.userName}:</strong> {r.rating} ⭐
                                    {r.review && ` - ${r.review}`}
                                    <br />
                                    <small>Service: {r.service}</small>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No ratings yet</p>
                    )}
                </div>
            </div>

            <div className="button-group">
                <button
                    className={provider.available ? "btn-danger" : "btn-primary"}
                    onClick={toggleStatus}
                    disabled={loading}
                >
                    {provider.available ? "Deactivate" : "Activate"}
                </button>

                <button
                    className="btn-secondary"
                    onClick={() => navigate("/providers/providerlist")}
                >
                    Back to List
                </button>

                <button
                    className="btn-primary"
                    onClick={() => navigate(`/providers/update/${provider._id}`)}
                >
                    Edit Provider
                </button>
            </div>
        </div>
    );
};

export default Detail;