import React, { useEffect, useState } from "react";
import './detail.css';
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
                    setProvider(res.data.data);
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
                setProvider((prev) => ({ ...prev, available: res.data.available }));
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

    if (!provider) return <p>Loading provider details...</p>;

    return (
        <div>
            <img
                src={provider.image ? `${url}${provider.image}` : "/default-avatar.png"}
                alt={provider.name}
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
            />
            <h2>{provider.name}</h2>
            <p>Email: {provider.email}</p>
            <p>Services: {provider.servicesOffered.map((s) => s.name).join(", ")}</p>
            <p>Status: {provider.available ? "Available" : "Not Available"}</p>
            <p>Profile Complete: {provider.isProfileComplete ? "Yes" : "No"}</p>
            <p>Joined At: {new Date(provider.createdAt).toLocaleDateString()}</p>

            <button onClick={toggleStatus} disabled={loading} style={{ marginRight: "10px" }}>
                {provider.available ? "Deactivate" : "Activate"}
            </button>
            <button onClick={() => navigate(`/providers/providerlist`)}>
                Back to List
            </button>
            <button onClick={() => navigate(`/providers/update/${provider._id}`)}>
                Edit Provider
            </button>

        </div>
    );
};

export default Detail;
