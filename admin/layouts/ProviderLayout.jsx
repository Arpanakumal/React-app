import React from "react";
import ProviderNavbar from '../src/provider/components/navbar/Navbar';

import { Outlet } from "react-router-dom";

const ProviderLayout = () => {
    return (
        <div>
            <ProviderNavbar />
            <hr />
            <div className="app-content">

                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default ProviderLayout;
