import React, { useState } from "react";
import './login.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as assets from "../../assets/assets";

const AdminLogin = () => {
    const navigate = useNavigate();
    const url = import.meta.env.VITE_API_URL;

    const [data, setData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;

        setData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const togglePassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(
                `${url}/api/admin/login`,
                data
            );

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("role", res.data.role);
                localStorage.setItem("name", res.data.name);

                navigate("/dashboard");
            } else {
                alert(res.data.message || "Invalid credentials");
            }

        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Server error. Please try again.";

            console.error("Admin login error:", err.response?.data || err);
            alert(message);
        }
    };

    return (
        <div className="login-popup">
            <form 
                className="login-popup-container" 
                onSubmit={handleSubmit}
            >
                <div className="login-popup-title">
                    <h2>Admin Login</h2>
                </div>

                <div className="login-popup-inputs">

                    <input
                        type="email"
                        name="email"
                        placeholder="Admin Email"
                        value={data.email}
                        onChange={onChangeHandler}
                        required
                    />

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            value={data.password}
                            onChange={onChangeHandler}
                            required
                        />

                        <span 
                            className="eye-icon" 
                            onClick={togglePassword}
                        >
                            <img
                                src={
                                    showPassword 
                                    ? assets.eyeOpen 
                                    : assets.eyeClosed
                                }
                                alt="toggle"
                            />
                        </span>
                    </div>

                </div>

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    );
};

export default AdminLogin;