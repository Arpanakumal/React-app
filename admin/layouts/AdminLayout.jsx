import React from "react";
import Navbar from "../src/component/Navbar/Navbar";
import Sidebar from "../src/component/Sidebar/Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
    return (
        <div>
            <Navbar />
            <hr />
            <div className="app-content">
                <Sidebar />
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
