import React, { useState } from "react";
import './login.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Forgotpassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:3001/api/provider/forgot-password",
                { email }
            );

            if (res.data.success && res.data.redirect) {
                localStorage.setItem("providerResetToken", res.data.resetToken);

                toast.success("Check your email to reset your password!", {
                    autoClose: 2000, 
                    onClose: () => navigate("/provider/reset-password") 
                });
            } else {
                toast.error(res.data.message || "Something went wrong");
            }
        } catch (err) {
            console.error("Forgot password error:", err);
            toast.error("Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-popup">
            <form className="login-popup-container" onSubmit={handleSubmit}>
                <div className="login-popup-title">
                    <h2>Forgot Password</h2>
                </div>

                <div className="login-popup-inputs">
                    <input
                        type="email"
                        name="email"
                        placeholder="Provider Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
};

export default Forgotpassword;