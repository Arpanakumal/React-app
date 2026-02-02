import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import './Navbar.css';
import { logo, searchIcon, profile, logoutIcon, booking } from '../../assets/assets';
import { Link } from "react-router-dom";
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("Home");
    const [pendingCount, setPendingCount] = useState(0);

    const { token, setToken } = useContext(StoreContext);

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        navigate("/")

    }

    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />

            <ul className="navbar-menu">
                <li>
                    <Link
                        to="/"
                        onClick={() => setMenu("Home")}
                        className={menu === "Home" ? "active" : ""}
                    >
                        Home
                    </Link>
                </li>

                <li>
                    <Link
                        to="/service"
                        onClick={() => setMenu("Services")}
                        className={menu === "Services" ? "active" : ""}
                    >
                        Services
                    </Link>
                </li>
                <li>
                    <Link
                        to="/book"
                        onClick={() => setMenu("book")}
                        className={menu === "book" ? "active" : ""}
                    >
                        Book
                    </Link>
                </li>

                <li>
                    <Link
                        to="/blog"
                        onClick={() => setMenu("Blog")}
                        className={menu === "Blog" ? "active" : ""}
                    >
                        Blog
                    </Link>
                </li>

                <li>
                    <Link
                        to="/about"
                        onClick={() => setMenu("About us")}
                        className={menu === "About us" ? "active" : ""}
                    >
                        About Us
                    </Link>
                </li>

                <li>
                    <Link
                        to="/contact"
                        onClick={() => setMenu("Contact us")}
                        className={menu === "Contact us" ? "active" : ""}
                    >
                        Contact Us
                    </Link>
                </li>
            </ul>


            <div className="navbar-right">
                <img src={searchIcon} alt="Search" className="search-icon" />
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
