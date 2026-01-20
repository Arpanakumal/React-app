import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { logo, message, profile } from '../../assets/assets';

const Navbar = () => {
    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />

            <div className="navbar-right">

                <Link to="/messages">
                    <img src={message} alt="Messages" className="message" />
                </Link>

                <img src={profile} alt="Profile" className="profile" />
            </div>
        </div>
    );
};

export default Navbar;
