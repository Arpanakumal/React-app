
import React, { useState } from "react";
import './login.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as assets from "../../../assets/assets";

const Providerlogin = () => {
    const navigate = useNavigate();
    const [data, setData] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const togglePassword = () => setShowPassword((prev) => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:3001/api/provider/login",
                data
            );

            if (res.data.success) {

                localStorage.setItem("pToken", res.data.token);
                localStorage.setItem("provider_role", res.data.role);
                localStorage.setItem("provider_name", res.data.name);
                localStorage.setItem("provider_id", res.data.id);

                navigate("/provider/dashboard");
            } else {
                alert(res.data.message || "Invalid credentials");
            }
        } catch (err) {
            console.error("Provider login error:", err);
            alert("Server error. Please try again.");
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <div className="login-popup-title">
                    <h2>Provider Login</h2>
                </div>

                <div className="login-popup-inputs">
                    <input
                        type="email"
                        name="email"
                        placeholder="Provider Email"
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
                        <span className="eye-icon" onClick={togglePassword}>
                            <img
                                src={showPassword ? assets.eyeOpen : assets.eyeClosed}
                                alt="toggle"
                            />
                        </span>
                    </div>

                    <div className="forgot-password">
                        <a href="/provider/forgot-password">Forgot Password?</a>
                    </div>
                </div>

                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Providerlogin;
