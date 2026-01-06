import React from 'react'
import './Footer.css'
import * as assets from '../../assets/assets'

import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";

const Footer = () => {
    return (
        <div className="footer" id="footer">
            <div className="footer-content">

                <div className="footer-content-left">

                    <img src={assets.logo} alt="HomeEase Logo" />

                    <p>
                        Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                        Sint distinctio nam dolore! Consequatur, quo.
                    </p>


                    <div className="footer-social-icons">
                        <FaFacebookF />
                        <FaInstagram />
                        <FaTwitter />
                    </div>
                </div>

                <div className="footer-content-center">
                    <h2>Company</h2>
                    <ul>
                        <li>Home</li>
                        <li>About Us</li>
                        <li>Appointment</li>
                        <li>Privacy Policy</li>
                    </ul>
                </div>

                <div className="footer-content-right">
                    <h2>GET IN TOUCH</h2>
                    <ul>
                        <li>9712344332</li>
                        <li>contact@homeease.com</li>
                    </ul>
                </div>

            </div>

            <hr />
            <p className="footer-copyright">
                Copyright 2026 © HomeEase.com - All Rights Reserved
            </p>
        </div>
    )
}

export default Footer
