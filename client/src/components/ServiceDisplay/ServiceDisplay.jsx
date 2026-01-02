import React, { useContext, useState } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './ServiceDisplay.css'
import { Service_list } from '../../assets/assets'
import ServiceItem from '../ServiceItem/ServiceItem'


const ServiceDisplay = ({ category }) => {
    const { Service_list } = useContext(StoreContext);

    return (
        <div className='service-display' id='service-display'>
            <h2>Local Service Favorites Near You</h2>
            <div className="service-display-list">
                {Service_list.map((item, index) => {
                    if (category === "All" || category === item.category) {
                        return (
                            <ServiceItem
                                key={index}
                                id={item._id} 
                                name={item.name}
                                description={item.description}
                                price_info={item.price_info}
                                image={item.image}
                                rating={item.rating}
                            />
                        )
                    }
                    return null; 
                })}
            </div>
        </div>
    );
}



export default ServiceDisplay