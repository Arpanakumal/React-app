import React from 'react';
import { NavLink } from 'react-router-dom';
import './sidebar.css';

const Sidebar = () => {
    return (
        <div className="sidebar">
            <nav className="sidebar-nav">
                <NavLink
                    to="/dashboard"
                    className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to="/services"
                    className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                    Services
                </NavLink>

                <NavLink
                    to="/bookings"
                    className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                    Bookings
                </NavLink>

                <NavLink
                    to="/customers"
                    className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                    Customers
                </NavLink>

                <NavLink
                    to="/providers"
                    className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
                >
                    Providers
                </NavLink>
            </nav>
        </div>
    );
};

export default Sidebar;
