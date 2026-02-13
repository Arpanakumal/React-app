import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const AdminProtectRoute = ({ children }) => {
    const token = localStorage.getItem("token");

    if (!token) {
        return <Navigate to="/" />;
    }

    try {
        const decoded = jwtDecode(token);

        if (decoded.role !== "admin") {
            return <Navigate to="/" />;
        }

        return children;
    } catch (err) {
        return <Navigate to="/" />;
    }
};

export default AdminProtectRoute;
