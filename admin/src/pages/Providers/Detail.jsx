import React, { useEffect, useState } from "react";
import "./detail.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Detail = ({ url }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [provider, setProvider] = useState(null);
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
                {
                    headers: { atoken: token },
                }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                setProvider((prev) => ({
                    ...prev,
                    available: res.data.available,
                }));
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

    if (!provider)
        return <p className="loading-text">Loading provider details...</p>;

    return (
        <div className="detail-container">
            <div className="detail-header">
                <img
                    src={
                        provider.image
                            ? `${url}${provider.image}`
                            : "/default-avatar.png"
                    }
                    alt={provider.name}
                />
                <h2>{provider.name}</h2>
            </div>

            <div className="detail-info">
                <p>
                    <span>Phone:</span> {provider.phone || "N/A"}
                </p>

                <p>
                    <span>Email:</span> {provider.email}
                </p>

                <p>
                    <span>Services:</span>{" "}
                    {provider.servicesOffered.map((s) => s.name).join(", ")}
                </p>

                <p>
                    <span>Status:</span>{" "}
                    <span
                        className={`status ${provider.available ? "available" : "unavailable"
                            }`}
                    >
                        {provider.available ? "Available" : "Not Available"}
                    </span>
                </p>

                <p>
                    <span>Profile Complete:</span>{" "}
                    {provider.isProfileComplete ? "Yes" : "No"}
                </p>

                <p>
                    <span>Joined At:</span>{" "}
                    {new Date(provider.createdAt).toLocaleDateString()}
                </p>
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
