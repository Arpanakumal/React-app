import { useState, createContext } from "react";

export const ProviderContext = createContext();

const backendUrl = import.meta.env.VITE_API_URL;

const ProviderContextProvider = (props) => {
    const [pToken, setPToken] = useState(localStorage.getItem('pToken') || '');

    const setPTokenAndStore = (token) => {
        setPToken(token);
        if (token) {
            localStorage.setItem('pToken', token);
        } else {
            localStorage.removeItem('pToken');
        }
    };

    const value = {
        pToken,
        setPToken: setPTokenAndStore,
        backendUrl,
    };

    return (
        <ProviderContext.Provider value={value}>
            {props.children}
        </ProviderContext.Provider>
    );
};

export default ProviderContextProvider;
