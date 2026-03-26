import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./providerList.css";
import axios from "axios";
import { toast } from "react-toastify";

const ProviderList = ({ url }) => {
    const [providers, setProviders] = useState([]);
    const [filteredProviders, setFilteredProviders] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedServices, setSelectedServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const fetchProviders = async () => {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${url}/api/provider`, {
                headers: { atoken: token },
            });

            if (!res.data.success) {
                return toast.error("Failed to fetch providers");
            }

            const data = res.data.data;

            setProviders(data);

            const allServices = data.flatMap(p =>
                p.servicesOffered.map(s => s.name)
            );
            setServices([...new Set(allServices)]);

            setFilteredProviders([]); 
        } catch (err) {
            console.error(err);
            toast.error("Server error while fetching providers");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);


    useEffect(() => {
        let filtered = providers;

        if (selectedServices.length > 0) {
            filtered = providers.filter(provider =>
                provider.servicesOffered?.some(s => selectedServices.includes(s.name))
            );
        }


        filtered.sort((a, b) => (b.rankingScore || 0) - (a.rankingScore || 0));

        setFilteredProviders(filtered);
    }, [selectedServices, providers]);

    const toggleService = (serviceName) => {
        setSelectedServices(prev =>
            prev.includes(serviceName)
                ? prev.filter(s => s !== serviceName)
                : [...prev, serviceName]
        );
    };

    if (loading) return <p>Loading providers...</p>;

    return (
        <div className="list-container">
            <p className="list-title">All Providers</p>

            <div className="service-filter">
                <label>Filter by Services:</label>
                <div className="service-options">
                    {services.map((s, idx) => (
                        <button
                            key={idx}
                            className={`service-button ${selectedServices.includes(s) ? "selected" : ""}`}
                            onClick={() => toggleService(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="list-table">
                {selectedServices.length === 0 ? (
                    <p>Please select a service to view providers</p>
                ) : filteredProviders.length === 0 ? (
                    <p>No providers found for selected services</p>
                ) : (
                    filteredProviders.map(provider => (
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

                            <p className="provider-name">{provider.name}</p>
                            <p className="provider-email">{provider.email}</p>
                            <p className="provider-services">
                                {provider.servicesOffered.map(s => s.name).join(", ")}
                            </p>

                            <p className={provider.available ? "status-active" : "status-inactive"}>
                                {provider.available ? "Available" : "Not Available"}
                            </p>

                            <p className="provider-score">⭐ Score: {provider.rankingScore?.toFixed(2) || 0}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProviderList;