
import React, { useState } from 'react'
import './Navbar.css'
import { logo, searchIcon } from '../../assets/assets'

const Navbar = () => {

    const [menu, setMenu] = useState("Home");
    return (
        <div className="navbar">
            <img src={logo} alt="Logo" className="logo" />

            <ul className="navbar-menu">
                <li onClick={() => setMenu("Home")} className={menu === "Home" ? "active" : ""}>Home</li>
                <li onClick={() => setMenu("Services")} className={menu === "Services" ? "active" : ""}>Services</li>
                <li onClick={() => setMenu("Blog")} className={menu === "Blog" ? "active" : ""}>Blog</li>
                <li onClick={() => setMenu("About us")} className={menu === "About us" ? "active" : ""}>About us</li>
                <li onClick={() => setMenu("Contact us")} className={menu === "Contact us" ? "active" : ""}>Contact us</li>
            </ul>


            <div className="navbar-right">
                <img src={searchIcon} alt="Search" className="search-icon" />
                <button>Sign In</button>
            </div>
        </div>

    )
}

export default Navbar
