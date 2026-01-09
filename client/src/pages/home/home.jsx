import React from 'react'
import './home.css'
import Header from '../../components/header/Header';

import { useState } from 'react';





const Home = () => {

    const [category, setCategory] = useState("All");


    return (
        <div>
            <Header />


        </div>
    );
};

export default Home;

