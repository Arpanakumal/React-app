import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { StoreContext } from "../context/StoreContext";

const ProtectedRoute = ({ children, allowedRole }) => {
    const { token, role } = useContext(StoreContext);

    if (!token) {
        return <Navigate to="/" />;
    }

    if (allowedRole && role !== allowedRole) {
        return <Navigate to="/" />;
    }

    return children;
};

export default ProtectedRoute;