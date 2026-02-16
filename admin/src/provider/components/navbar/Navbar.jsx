import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import { logo, message } from '../../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const API_URL = import.meta.env.VITE_API_URL;
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchProviderProfile = async () => {
            try {
                const token = localStorage.getItem("pToken");
                if (!token) return;

                const decoded = jwtDecode(token);
                const providerId = decoded.id;

                const res = await axios.get(`${API_URL}/api/provider/${providerId}`);
                if (res.data.success && res.data.provider) {
                    setProfileImage(res.data.provider.image);
                }
            } catch (err) {
                console.error("Error fetching provider profile:", err);
            }
        };

        fetchProviderProfile();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("pToken");
        localStorage.removeItem("provider_role");
        localStorage.removeItem("provider_name");
        localStorage.removeItem("provider_id");
        window.location.href = "http://localhost:3000";
    };

    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />

            <div className="navbar-right">

                <div className="profile-wrapper" ref={dropdownRef}>
                    <img
                        src={profileImage ? `${API_URL}${profileImage}` : '/default-profile.png'}
                        alt="Profile"
                        className="profile"
                        onClick={() => setShowDropdown(prev => !prev)}
                    />


                    {showDropdown && (
                        <div className="profile-dropdown">
                            <button onClick={handleLogout}>Logout</button>
                            <Link to="/provider/profile">
                                <button>Profile</button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;