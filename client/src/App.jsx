import React, { useState } from "react";
import './index.css';
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Book from "./pages/Book/Book";
import BookingConfirmation from "./pages/bookingConfirmation/booking";
import ServiceDisplay from "./pages/ServiceDisplay/ServiceDisplay";
import { StoreContext } from "./context/StoreContext";
import { Service_list } from "./assets/assets";
import Footer from "./components/Footer/Footer";
import Contact from "./pages/Contact/Contact";
import About from "./pages/Aboutus/About";
import LoginPopup from './components/LoginPopup/Loginpopup';


const App = () => {

const [showLogin,setShowLogin]=useState(false)


  const [services, setServices] = useState(Service_list);

  return (
    <StoreContext.Provider value={{ Service_list: services, setServices }}>

      {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <BrowserRouter>
        <div className="app">
          <Navbar setShowLogin={setShowLogin} />

    <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/service" element={<ServiceDisplay />} />
            <Route path="/book" element={<Book />} />
            <Route path="/booking" element={<BookingConfirmation />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />}/>
          </Routes>
</div>
          <Footer />
        </div>
      </BrowserRouter>
    </StoreContext.Provider>
  );
};

export default App;
