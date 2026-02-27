import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './loginpopup.css';

const UserForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/user/forgot-password`, { email });

            if (res.data.success) {
                toast.success(res.data.message || "Check your email for reset link", {
                    autoClose: 2000,
                    onClose: () => {
                        localStorage.setItem("userResetToken", res.data.resetToken);
                        navigate(`/user/reset-password/${res.data.resetToken}`);
                    }
                });
            } else {
                toast.error(res.data.message || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error. Please try again.");
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <h2>Forgot Password</h2>
                <div className="login-popup-inputs">
                    <input
                        type="email"
                        placeholder="Your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="submit">Send Reset Link</button>
                </div>
            </form>
        </div>
    );
};

export default UserForgotPassword;