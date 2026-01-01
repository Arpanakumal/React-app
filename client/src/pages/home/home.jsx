import React from 'react'
import './home.css'
import Header from '../../components/header/Header';
import ExploreService from '../../components/ExploreServices/ExploreService';
import ServiceDisplay from '../../components/ServiceDisplay/ServiceDisplay';
import { useState } from 'react';





const Home = () => {

    const [category, setCategory] = useState("All");


    return (
        <div>
            <Header />
            <ExploreService category={category} setCategory={setCategory} />
            <ServiceDisplay category={category} />

        </div>
    );
};

export default Home;

