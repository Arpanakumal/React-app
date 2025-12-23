
import React from 'react'
import './Navbar.css'
import {assets, logo} from '../../assets/assets'

const Navbar = () => {
    return (
        <div classname='navbar'>
            <img src={logo} alt=""  className="logo"/>
            <ul className="navbar-menu">
                <li>Home</li>
                <li>Services</li>
                <li>Blog</li>
                <li>About Us</li>
                <li>Contact Us</li>
            </ul>
        </div>
    )
}

export default Navbar
