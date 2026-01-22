import { createContext, useState } from "react";
import { Service_list } from "../assets/assets";
import { provider_list } from '../assets/providers';

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {


    const [selectedServices, setSelectedServices] = useState({});

    const url = "http://localhost:3001";
    const [token,setToken]= useState("");

    const addService = (serviceId) => {

        const service = Service_list.find(s => s._id === serviceId);

        const provider = provider_list.find(p => p.expertise === service?.category);

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
            [serviceId]: {
                ...prev[serviceId],
                providers: numProviders
            }
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
            const service = Service_list.find(s => s._id === serviceId);
            if (service) {
                const providers = selectedServices[serviceId].providers;
                total += service.price * providers;
            }
        }
        return total;
    };

    const contextValue = {
        Service_list,
        selectedServices,
        addService,
        updateProviders,
        removeService,
        getTotalAmount,
        url,
        token,
        setToken
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
