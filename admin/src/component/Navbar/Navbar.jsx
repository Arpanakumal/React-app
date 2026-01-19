import React from 'react';
import './navbar.css';
import { logo, profile } from '../../assets/assets';

const Navbar = () => {
    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />
            <img src={profile} alt="Profile" className="profile" />
        </div>
    );
};

export default Navbar;
