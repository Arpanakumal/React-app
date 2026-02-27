import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./loginpopup.css";
import * as assets from "../../assets/assets";

const UserResetpassword = () => {
    const navigate = useNavigate();
    const { token } = useParams();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const togglePassword = () => setShowPassword(prev => !prev);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Invalid or missing reset token.");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/user/reset-password`,
                {
                    token,
                    newPassword: password
                }
            );

            if (res.data.success) {
                toast.success("Password reset successfully!", {
                    autoClose: 2000,
                    onClose: () => navigate("/login")
                });
            } else {
                toast.error(res.data.message || "Failed to reset password");
            }

        } catch (err) {
            console.error("Reset error:", err);

            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error("Server error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <h2>Reset Password</h2>
                <div className="login-popup-inputs">

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
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

                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
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

                    <button type="submit" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>
                </div> 
            </form>
        </div>
    );
};

export default UserResetpassword;