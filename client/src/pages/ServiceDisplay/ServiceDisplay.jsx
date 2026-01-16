import React, { useContext, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import './ServiceDisplay.css';
import ServiceItem from '../../components/ServiceItem/ServiceItem';
import ExploreService from '../../pages/ExploreServices/ExploreService';

const ServiceDisplay = () => {
    const { Service_list } = useContext(StoreContext);
    const [category, setCategory] = useState("All");

    return (
        <div className='service-display' id='service-display'>
            <ExploreService category={category} setCategory={setCategory} />

            <div className="service-display-list">
                {Service_list.map((item) => {
                    if (category === "All" || category === item.category) {
                        return (
                            <ServiceItem
                                key={item._id}
                                id={item._id}
                                name={item.name}
                                description={item.description}
                                price_info={item.price_info}
                                image={item.image}
                                rating={item.rating}
                            />
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default ServiceDisplay;
