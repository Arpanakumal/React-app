import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className="sidebar-link">
                    Dashboard
                </NavLink>

                <NavLink to="/services" className="sidebar-link">
                    Services
                </NavLink>

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
