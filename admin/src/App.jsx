import React from 'react';
import Navbar from "./component/Navbar/Navbar";
import Sidebar from "./component/Sidebar/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Services from "./pages/Services/Service";
import Booking from "./pages/Booking/Booking";
import Customers from "./pages/Customers/Customer";
import Providers from "./pages/Providers/Provider";
import Messages from './pages/Messages/Message';


const App = () => {
  return (
    <div>
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/bookings" element={<Booking />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/providers" element={<Providers />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
