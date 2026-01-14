import { createContext, useState } from "react";
import { Service_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {


    const [selectedServices, setSelectedServices] = useState({});

    const addService = (serviceId) => {
        setSelectedServices((prev) => ({
            ...prev,
            [serviceId]: prev[serviceId]
                ? { ...prev[serviceId] }
                : { providers: 1 },
        }));
    };


    const updateProviders = (serviceId, numProviders) => {
        setSelectedServices((prev) => ({
            ...prev,
            [serviceId]: { providers: numProviders }
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
            const service = Service_list.find(
                (s) => s._id === serviceId
            );
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
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
