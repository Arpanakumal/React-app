import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./providerList.css";
import axios from "axios";
import { toast } from "react-toastify";

const ProviderList = ({ url }) => {



    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchProviders = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Admin not logged in");
                return;
            }

            const res = await axios.get(`${url}/api/provider`, {
                headers: { atoken: token },
            });

            if (res.data.success) {
                setProviders(res.data.data);
            } else {
                toast.error("Failed to fetch providers");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server error while fetching providers");
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchProviders();
    }, []);

    if (loading) return <p>Loading providers...</p>;

    return (
        <div className="list-container">
            <p className="list-title">All Providers</p>
            <div className="list-table">
                {providers.map(provider => (
                    <div
                        key={provider._id}
                        className="list-table-format"
                        onClick={() => navigate(`/providers/detail/${provider._id}`)}
                    >
                        <img
                            src={provider.image ? `${url}${provider.image}` : "/default-avatar.png"}
                            alt={provider.name}
                            className="provider-image"
                        />
                        <p>{provider.name}</p>
                        <p>{provider.phone || "N/A"}</p>

                        <p>{provider.email}</p>
                        <p>{provider.servicesOffered.map(s => s.name).join(", ")}</p>
                        <p className={provider.available ? "status-active" : "status-inactive"}>
                            {provider.available ? "Available" : "Not Available"}
                        </p>

                    </div>

                ))}
            </div>
        </div>
    );
};

export default ProviderList;
