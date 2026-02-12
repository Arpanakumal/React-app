import React from "react";
import ProviderNavbar from '../src/provider/components/navbar/Navbar';
import ProviderSidebar from '../src/provider/components/sidebar/Sidebar';
import { Outlet } from "react-router-dom";

const ProviderLayout = () => {
    return (
        <div>
            <ProviderNavbar />
            <hr />
            <div className="app-content">
                <ProviderSidebar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProviderLayout;
