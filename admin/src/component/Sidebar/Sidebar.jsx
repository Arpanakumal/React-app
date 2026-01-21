import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
    const [servicesOpen, setServicesOpen] = useState(false);

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="sidebar-link">
                    Dashboard
                </NavLink>


                <div className="sidebar-link" onClick={() => setServicesOpen(!servicesOpen)}>
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

                <NavLink to="/bookings" className="sidebar-link">
                    Bookings
                </NavLink>

                <NavLink to="/customers" className="sidebar-link">
                    Customers
                </NavLink>

                <NavLink to="/providers" className="sidebar-link">
                    Providers
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
