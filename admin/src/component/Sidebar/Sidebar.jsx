import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
    const [servicesOpen, setServicesOpen] = useState(false);
    const [providersOpen, setProvidersOpen] = useState(false);
    const [blogsOpen, setBlogsOpen] = useState(false);

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">

                {/* Services */}
                <div
                    className="sidebar-link"
                    onClick={() => setServicesOpen(!servicesOpen)}
                >
                    Services
                </div>
                {servicesOpen && (
                    <div className="sidebar-submenu">
                        <NavLink to="/services" className="sidebar-sublink">
                            Add Service
                        </NavLink>
                        <NavLink to="/services/list" className="sidebar-sublink">
                            List Services
                        </NavLink>
                    </div>
                )}

                {/* Providers */}
                <div
                    className="sidebar-link"
                    onClick={() => setProvidersOpen(!providersOpen)}
                >
                    Providers
                </div>
                {providersOpen && (
                    <div className="sidebar-submenu">
                        <NavLink to="/providers" className="sidebar-sublink">
                            Add Provider
                        </NavLink>
                        <NavLink to="/providers/providerlist" className="sidebar-sublink">
                            List Providers
                        </NavLink>
                    </div>
                )}


                <NavLink to="/bookings" className="sidebar-link">
                    Bookings
                </NavLink>


                <NavLink to="/customers" className="sidebar-link">
                    Customers
                </NavLink>

                <div
                    className="sidebar-link"
                    onClick={() => setBlogsOpen(!blogsOpen)}
                >
                    Blogs
                </div>
                {blogsOpen && (
                    <div className="sidebar-submenu">
                        <NavLink to="/blog" className="sidebar-sublink">
                            Add Blog
                        </NavLink>
                        <NavLink to="/display" className="sidebar-sublink">
                            List Blogs
                        </NavLink>
                    </div>
                )}

            </nav>
        </div>
    );
};

export default Sidebar;