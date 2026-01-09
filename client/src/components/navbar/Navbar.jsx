import React, { useState } from 'react';
import './Navbar.css';
import { logo, searchIcon } from '../../assets/assets';
import { Link } from "react-router-dom";

const Navbar = ({setShowLogin}) => {
    const [menu, setMenu] = useState("Home");

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
                <button onClick={()=>setShowLogin(true)}>Sign In</button>
            </div>
        </div>
    );
};

export default Navbar;
