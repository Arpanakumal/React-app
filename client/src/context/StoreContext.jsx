import { createContext } from "react";
import { Service_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const contextValue = {
        Service_list,

    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
