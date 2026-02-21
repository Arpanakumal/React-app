import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { provider_list } from "../assets/providers";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
    const [selectedServices, setSelectedServices] = useState(
        () => JSON.parse(localStorage.getItem("selectedServices")) || {}
    );

    useEffect(() => {
        localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
    }, [selectedServices]);

    const [Service_list, setServiceList] = useState([]);

    const addService = (serviceId) => {
        const service = Service_list.find((s) => s._id === serviceId);
        const provider = provider_list.find((p) => p.expertise === service?.category);

        setSelectedServices((prev) => ({
            ...prev,
            [serviceId]: prev[serviceId]
                ? { ...prev[serviceId] }
                : { providers: 1, provider },
        }));
    };

    const updateProviders = (serviceId, numProviders) => {
        setSelectedServices((prev) => ({
            ...prev,
            [serviceId]: { ...prev[serviceId], providers: numProviders },
        }));
    };

    const removeService = (serviceId) => {
        setSelectedServices((prev) => {
            const updated = { ...prev };
            delete updated[serviceId];
            return updated;
        });
    };

    const getTotalAmount = () => {
        let total = 0;
        for (const serviceId in selectedServices) {
            const service = Service_list.find((s) => s._id === serviceId);
            if (service) {
                const providers = selectedServices[serviceId].providers;
                total += Number(service.price_info || service.price) * providers;
            }
        }
        return total;
    };

    const url = "http://localhost:3001/api";


    const [token, setToken] = useState(localStorage.getItem("user_token") || "");
    const [role, setRole] = useState(localStorage.getItem("user_role") || "");
    const [userName, setUserName] = useState(localStorage.getItem("user_name") || "");
    const [userId, setUserId] = useState(localStorage.getItem("user_id") || "");

    const getAuthAxios = () => {
        return axios.create({
            baseURL: url,
            headers: { Authorization: `Bearer ${token}` } 
        });
    };

    useEffect(() => {
        if (token) localStorage.setItem("user_token", token);
        if (role) localStorage.setItem("user_role", role);
        if (userName) localStorage.setItem("user_name", userName);
        if (userId) localStorage.setItem("user_id", userId);
    }, [token, role, userName, userId]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await axios.get(`${url}/Service/list`);
                if (res.data.success) setServiceList(res.data.data);
            } catch (error) {
                console.error("Error fetching services:", error);
            }
        };
        fetchServices();
    }, []);

    const logout = () => {
        setToken("");
        setRole("");
        setUserName("");
        setUserId("");
        localStorage.clear();
        window.location.href = "/";
    };

    return (
        <StoreContext.Provider
            value={{
                Service_list,
                selectedServices,
                addService,
                updateProviders,
                removeService,
                getTotalAmount,
                url,
                token,
                setToken,
                role,
                setRole,
                userName,
                setUserName,
                userId,
                setUserId,
                logout,
                getAuthAxios,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;