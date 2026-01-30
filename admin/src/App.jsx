import React, { useEffect } from 'react';
import Navbar from "./component/Navbar/Navbar";
import Sidebar from "./component/Sidebar/Sidebar";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Services from "./pages/Services/Service";
import List from './pages/Services/List';
import Update from './pages/Services/Update';
import Booking from "./pages/Booking/Booking";
import Customers from "./pages/Customers/Customer";
import Providers from "./pages/Providers/Provider";
import ProviderList from './pages/Providers/ProviderList';
import Detail from './pages/Providers/Detail';
import EditProvider from './pages/Providers/Edit';
import Messages from './pages/Messages/Message';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const url = "http://localhost:3001";

  useEffect(() => {

    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromFrontend = urlParams.get("token");

    if (tokenFromFrontend) {
      localStorage.setItem("token", tokenFromFrontend);

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div>
      <ToastContainer />
      <Navbar />
      <hr />
      <div className="app-content">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/services" element={<Services url={url} />} />
            <Route path="/services/list" element={<List url={url} />} />
            <Route path="/services/update/:id" element={<Update url={url} />} />

            <Route path="/bookings" element={<Booking url={url} />} />
            <Route path="/messages" element={<Messages url={url} />} />
            <Route path="/customers" element={<Customers url={url} />} />
            <Route path="/providers" element={<Providers url={url} />} />
            <Route path="/providers/providerlist" element={<ProviderList url={url} />} />
            <Route path="/providers/detail/:id" element={<Detail url={url} />} />
            <Route path="/providers/update/:id" element={<EditProvider url={url} />} />


          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
