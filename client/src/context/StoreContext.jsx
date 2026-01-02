import { createContext, useState } from "react";
import { Service_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {


    const [selectedService, setSelectedService] = useState({});

    const selectService = (service) => {
        setSelectedService(service);
    };





    const contextValue = {
        Service_list,
        selectedService,
        setSelectedService,
        selectService,

    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
