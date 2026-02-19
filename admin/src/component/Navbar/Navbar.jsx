import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './navbar.css';
import { logo, message, profile } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
    const [unreadMessages, setUnreadMessages] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const API_URL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const dropdownRef = useRef(null);


    useEffect(() => {
        const fetchUnreadMessages = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await axios.get(`${API_URL}/api/messages/unread-count`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data.success) {
                    setUnreadMessages(res.data.count);
                } else {
                    console.warn("Failed to fetch unread messages:", res.data.message);
                }
            } catch (err) {
                console.error("Error fetching unread messages:", err);
                toast.error("Could not fetch unread messages");
            }
        };

        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 5000);
        return () => clearInterval(interval);
    }, [API_URL]);


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

        localStorage.removeItem("token"); 
        localStorage.removeItem("role");  
        localStorage.removeItem("name");  


        window.location.href = "http://localhost:3000";
    };



    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" onClick={()=>navigate("/dashboard")} />

            <div className="navbar-right">

                <Link to="/messages" className="message-link">
                    <div className="message-container">
                        <img src={message} alt="Messages" className="message" />
                        {unreadMessages > 0 && (
                            <span className="notif-badge">{unreadMessages}</span>
                        )}
                    </div>
                </Link>


                <div className="profile-wrapper" ref={dropdownRef}>
                    <img
                        src={profile}
                        alt="Profile"
                        className="profile"
                        onClick={() => setShowDropdown(prev => !prev)}
                    />
                    {showDropdown && (
                        <div className="profile-dropdown">
                            <button onClick={handleLogout}>Logout</button>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
