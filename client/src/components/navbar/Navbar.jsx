import React, { useContext, useState } from 'react';

import { toast } from 'react-toastify';
import './Navbar.css';
import { logo, searchIcon, profile, logoutIcon, booking } from '../../assets/assets';

import { StoreContext } from '../../context/StoreContext';
import { useLocation, Link, useNavigate } from "react-router-dom";

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("Home");
    const location = useLocation();
    const [pendingCount, setPendingCount] = useState(0);
    const isActive = (path) => location.pathname === path;

    const { token, setToken, logout } = useContext(StoreContext);

    const navigate = useNavigate();



    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />

            <ul className="navbar-menu">
                <li>
                    <Link to="/" className={isActive("/") ? "active" : ""}>
                        Home
                    </Link>
                </li>

                <li>
                    <Link to="/service" className={isActive("/service") ? "active" : ""}>
                        Services
                    </Link>
                </li>
                <li>
                    <Link
                        to="/book"
                        onClick={(e) => {
                            if (!token) {
                                e.preventDefault();
                                localStorage.setItem("redirect_after_login", "/book");
                                setShowLogin(true);
                                toast.error("Please login first");
                            } else {
                                setMenu("book");
                            }
                        }}
                        className={isActive("/book") ? "active" : ""}
                    >
                        Book
                    </Link>
                </li>

                <li>
                    <Link to="/blog" className={isActive("/blog") ? "active" : ""}>
                        Blog
                    </Link>
                </li>

                <li>
                    <Link to="/about" className={isActive("/about") ? "active" : ""}>
                        About Us
                    </Link>
                </li>

                <li>
                    <Link to="/contact" className={isActive("/contact") ? "active" : ""}>
                        Contact Us
                    </Link>
                </li>
            </ul>


            <div className="navbar-right">

                {!token ?
                    <button onClick={() => setShowLogin(true)}>Sign In</button>
                    : <div className='navbar-profile'>
                        <img src={profile} alt="" />
                        <ul className='nav-profile-dropdown'>
                            <li onClick={() => navigate("/profile")}>
                                <img src={profile} alt="" /> My Profile
                            </li>

                            <li onClick={() => navigate("/my-bookings")}>
                                <img src={booking} alt="" /> My Bookings
                                {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
                            </li>

                            <li onClick={logout}>
                                <img src={logoutIcon} alt="" /> Logout
                            </li>
                        </ul>

                    </div>

                }
            </div>
        </div>
    );
};

export default Navbar;
