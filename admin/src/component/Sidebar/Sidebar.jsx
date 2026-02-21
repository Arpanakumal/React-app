import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
    const [servicesOpen, setServicesOpen] = useState(false);
    const [providersOpen, setProvidersOpen] = useState(false);

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">


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

            </nav>
        </div>
    );
};

export default Sidebar;
