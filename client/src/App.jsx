import React, { useState } from "react";
import Navbar from "./components/navbar/Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Book from "./pages/Book/book";
import BookingConfirmation from "./pages/bookingConfirmation/booking";
import { StoreContext } from "./context/StoreContext";
import { Service_list } from "./assets/assets";

const App = () => {
  const [services, setServices] = useState(Service_list);

  return (
    <StoreContext.Provider value={{ Service_list: services, setServices }}>
      <div className="app">
        <Navbar />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/book" element={<Book />} />
            <Route path="/booking" element={<BookingConfirmation />} />
          </Routes>
        </BrowserRouter>
      </div>
    </StoreContext.Provider>
  );
};

export default App;
