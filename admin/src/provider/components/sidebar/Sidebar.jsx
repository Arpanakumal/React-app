import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
    const [servicesOpen, setServicesOpen] = useState(false);
    const [providersOpen, setProvidersOpen] = useState(false);

    return (
        <div className="sidebar">
            <nav className="sidebar-nav">

                <NavLink to="/provider/dashboard" className="sidebar-link">
                    Dashboard
                </NavLink>


                <NavLink to="/provider/booking" className="sidebar-link">
                    Bookings
                </NavLink>


            </nav>
        </div>
    );
};

export default Sidebar;
