import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Layouts
import AdminLayout from "../layouts/AdminLayout";
import ProviderLayout from "../layouts/ProviderLayout";
import AdminProtectRoute from "./routes/AdminProtectRoute";

// Admin Pages
import AdminDashboard from "./pages/Dashboard/Dashboard";
import Services from "./pages/Services/Service";
import List from "./pages/Services/List";
import Update from "./pages/Services/Update";
import Booking from "./pages/Booking/Booking";
import BookingDetail from "./pages/Booking/BookingDetail";
import Customers from "./pages/Customers/Customer";
import Providers from "./pages/Providers/Provider";
import ProviderList from "./pages/Providers/ProviderList";
import Detail from "./pages/Providers/Detail";
import EditProvider from "./pages/Providers/Edit";
import Messages from "./pages/Messages/Message";
import Login from "./pages/login/AdminLogin";
import Revenue from "./pages/Commission/Revenue";


// Provider Pages
import ProviderDashboard from "./provider/pages/Dashboard/Dashboard";
import Providerlogin from "./provider/pages/login/Providerlogin";
import ProviderBooking from "./provider/pages/Bookings/Booking";
import ProviderMessage from "./provider/pages/message/Message";
import ProviderProtectRoute from "./routes/ProviderProtectRoute";
import Bookinghistory from "./provider/pages/Bookings/history";
import BookingDetails from "./provider/pages/Bookings/BookingDetail";
import Commisson from "./provider/pages/commission/Commisson";
import Profile from "./provider/pages/Profile/Profile";


const App = () => {
  const url = "http://localhost:3001";


  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/provider/login" element={<Providerlogin />} />

        {/* Admin Routes */}
        <Route
          element={
            <AdminProtectRoute>
              <AdminLayout />
            </AdminProtectRoute>
          }
        >

          <Route path="/dashboard" element={<AdminDashboard url={url} />} />
          <Route path="/services" element={<Services url={url} />} />
          <Route path="/services/list" element={<List url={url} />} />
          <Route path="/services/update/:id" element={<Update url={url} />} />
          <Route path="/bookings" element={<Booking url={url} />} />
          <Route path="/bookings/detail/:id" element={<BookingDetail url={url} />} />
          <Route path="/messages" element={<Messages url={url} />} />
          <Route path="/customers" element={<Customers url={url} />} />
          <Route path="/providers" element={<Providers url={url} />} />
          <Route path="/providers/providerlist" element={<ProviderList url={url} />} />
          <Route path="/providers/detail/:id" element={<Detail url={url} />} />
          <Route path="/providers/update/:id" element={<EditProvider url={url} />} />
          <Route path="/revenue" element={<Revenue url={url} />} />


        </Route>

        {/* Provider Routes */}
        <Route
          element={
            <ProviderProtectRoute>
              <ProviderLayout />
            </ProviderProtectRoute>
          }
        >
          <Route path="/provider/dashboard" element={<ProviderDashboard url={url} />} />
          <Route path="/provider/booking" element={<ProviderBooking />} />
          <Route path="/provider/message" element={<ProviderMessage url={url} />} />
          <Route path="/provider/history" element={<Bookinghistory url={url} />} />
          <Route path="/provider/bookings/:id" element={<BookingDetails url={url} />} />
          <Route path="/provider/commission" element={<Commisson url={url} />} />
          <Route path="/provider/profile" element={<Profile url={url} />} />

        </Route>
      </Routes>
    </>
  );
};

export default App;
