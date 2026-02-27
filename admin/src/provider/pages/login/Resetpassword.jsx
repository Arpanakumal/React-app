import React, { useState, useEffect } from "react";
import './login.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import * as assets from "../../../assets/assets";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const togglePassword = () => setShowPassword((prev) => !prev);

    useEffect(() => {
        const storedToken = localStorage.getItem("providerResetToken");
        if (!storedToken) {
            toast.error("Reset token not found. Please request a new link.");
            navigate("/provider/forgot-password");
        } else {
            setToken(storedToken);
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                "http://localhost:3001/api/provider/reset-password",
                { token, newPassword: password }
            );

            if (res.data.success) {
                toast.success("Password reset successfully!", {
                    autoClose: 2000,
                    onClose: () => navigate("/provider/login")
                });
                localStorage.removeItem("providerResetToken");
            } else {
                toast.error(res.data.message || "Failed to reset password");
            }
        } catch (err) {
            console.error("Reset password error:", err);
            toast.error("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <div className="login-popup-title">
                    <h2>Reset Password</h2>
                </div>

                <div className="login-popup-inputs">
                    {/* New Password */}
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon" onClick={togglePassword}>
                            <img
                                src={showPassword ? assets.eyeOpen : assets.eyeClosed}
                                alt="toggle"
                            />
                        </span>
                    </div>

                    {/* Confirm Password */}
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <span className="eye-icon" onClick={togglePassword}>
                            <img
                                src={showPassword ? assets.eyeOpen : assets.eyeClosed}
                                alt="toggle"
                            />
                        </span>
                    </div>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;