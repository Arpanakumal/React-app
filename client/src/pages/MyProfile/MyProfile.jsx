import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./profile.css";
import * as assets from "../../assets/assets";

const MyProfile = () => {
    const [user, setUser] = useState({ id: "", name: "", email: "", password: "" });
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    const token = localStorage.getItem("user_token");
    const API_URL = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();


    const fetchUser = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });


            if (data.success) {
                const u = data.data;
                setUser({
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    password: "",
                });
            } else {
                toast.error(data.message || "Failed to fetch user");
            }
        } catch (err) {
            console.error("Fetch user error:", err);
            toast.error("Cannot reach backend. Is it running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);


    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("User not logged in");
            return;
        }

        try {
            const { data } = await axios.put(
                `${API_URL}/api/user/${user.id}/update`,
                {
                    name: user.name,
                    email: user.email,
                    password: user.password || undefined,
                },
                { headers: { atoken: token } }
            );

            if (data.success) {
                toast.success("Profile updated successfully!");
                setUser({ ...user, password: "" });


                setTimeout(() => {
                    navigate("/");
                }, 1500);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error("Update user error:", err);
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    };

    if (loading) return <p>Loading profile...</p>;

    return (
        <div className="profile-container">
            <h2>My Profile</h2>
            <form className="profile-form" onSubmit={handleUpdate}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Password:</label>
                    <div className="password-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={user.password}
                            onChange={handleChange}
                            placeholder="Leave blank to keep current password"
                        />
                        <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                                <img src={assets.eyeOpen} alt="Hide" />
                            ) : (
                                <img src={assets.eyeClosed} alt="Show" />
                            )}
                        </span>
                    </div>
                </div>

                <button type="submit" className="update-btn">
                    Update Profile
                </button>
            </form>
        </div>
    );
};

export default MyProfile;
