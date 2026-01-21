import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { logo, message, profile } from '../../assets/assets';

const Navbar = () => {

    const [unreadMessages, setUnreadMessages] = useState(0);


    useEffect(() => {
        const fetchUnreadMessages = () => {
            setUnreadMessages(3);
        };

        fetchUnreadMessages();
        const interval = setInterval(fetchUnreadMessages, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />

            <div className="navbar-right">

                <Link to="/messages" className="message-link">
                    <div className="message-container">
                        <img src={message} alt="Messages" className="message" />
                        {unreadMessages > 0 && (
                            <span className="notif-badge">{unreadMessages}</span>
                        )}
                    </div>
                </Link>


                <img src={profile} alt="Profile" className="profile" />
            </div>
        </div>
    );
};

export default Navbar;
