import React from 'react'
import Navbar from './components/navbar/Navbar'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/home/home'
import Book from './pages/Book/book'
import bookingConfirmation from './pages/bookingConfirmation/booking'

const App = () => {
  return (
    <div className='app'>
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/book' element={<Book />} />
          <Route path='/booking' element={<bookingConfirmation />} />

        </Routes>
      </BrowserRouter>


    </div>
  )
}

export default App
