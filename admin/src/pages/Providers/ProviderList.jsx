import React, { useEffect, useState } from "react";
import './list1.css';
import axios from "axios";
import { toast } from "react-toastify";

const ProviderList = ({ url }) => {
    const [providers, setProviders] = useState([]);

    const fetchProviders = async () => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Admin not logged in");
                return;
            }

            const res = await axios.get(`${url}/api/provider`, {
                headers: { atoken: token }
            });

            if (res.data.success) {
                setProviders(res.data.data);
            } else {
                toast.error("Failed to fetch providers");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    const toggleProvider = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.patch(
                `${url}/api/provider/${id}/toggle`,
                {},
                { headers: { atoken: token } }
            );

            if (res.data.success) {
                toast.success(res.data.message);
                fetchProviders();
            }
        } catch (err) {
            toast.error("Failed to update provider status");
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    return (
        <div className="list-container">
            <p className="list-title">All Providers</p>

            <div className="list-table">
                <div className="list-table-format title">
                    <b>Name</b>
                    <b>Email</b>
                    <b>Services</b>
                    <b>Status</b>
                    <b>Action</b>
                </div>

                {providers.map((provider) => (
                    <div key={provider._id} className="list-table-format">
                        <p>{provider.name}</p>
                        <p>{provider.email}</p>

                        <p>
                            {provider.servicesOffered?.length > 0
                                ? provider.servicesOffered.map(s => s.name).join(", ")
                                : "No services"}
                        </p>

                        <p
                            className={
                                provider.available ? "status-active" : "status-inactive"
                            }
                        >
                            {provider.available ? "Active" : "Inactive"}
                        </p>

                        <button
                            className="toggle-btn"
                            onClick={() => toggleProvider(provider._id)}
                        >
                            {provider.available ? "Deactivate" : "Activate"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProviderList;
