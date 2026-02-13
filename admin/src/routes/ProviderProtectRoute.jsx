import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const ProviderProtectRoute = ({ children }) => {
    const token = localStorage.getItem("pToken");

    if (!token) {
        return <Navigate to="/provider/login" />;
    }

    try {
        const decoded = jwtDecode(token);

        if (decoded.role !== "provider") {
            return <Navigate to="/provider/login" />;
        }

        return children;
    } catch (err) {
        return <Navigate to="/provider/login" />;
    }
};

export default ProviderProtectRoute;
