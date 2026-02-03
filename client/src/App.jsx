import React, { useState } from "react";
import { ToastContainer } from 'react-toastify';
import './index.css';
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Book from "./pages/Book/Book";
import BookingConfirmation from "./pages/BookingConfirmation/Booking";
import ServiceDisplay from "./pages/ServiceDisplay/ServiceDisplay";
import ServiceDetail from "./pages/ServiceDetail/ServiceDetail";
import Footer from "./components/Footer/Footer";
import Contact from "./pages/Contact/Contact";
import About from "./pages/Aboutus/About";
import LoginPopup from './components/LoginPopup/Loginpopup';
import StoreContextProvider from "./context/StoreContext";
import MyProfile from "./pages/MyProfile/MyProfile";

const App = () => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <StoreContextProvider>
      <BrowserRouter>
      <ToastContainer/>
        {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

        <div className="app">
          <Navbar setShowLogin={setShowLogin} />

          <div className="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/service" element={<ServiceDisplay />} />
              <Route path="/service/:id" element={<ServiceDetail />} />
              <Route path="/book" element={<Book />} />
              <Route path="/booking" element={<BookingConfirmation />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/profile" element={<MyProfile />}></Route>
            </Routes>
          </div>

          <Footer />
        </div>
      </BrowserRouter>
    </StoreContextProvider>

  );
};

export default App;
