import React from 'react'
import './ExploreService.css'
import { service_list } from '../../assets/assets'

const ExploreService = () => {
    return (
        <div className="explore-service" id="explore-service">
            <h1>Explore our services</h1>
            <p className="explore-service-text">
                Reliable home services made simple. HomeEase provides Electrical,
                Plumbing, Painting, Gardening, and Interior Services for design,
                consulting, and installation.
            </p>

            <div className="explore-service-list">
                {service_list.map((item, index) => {
                    return (
                        <div key={index} className="explore-service-list-item">
                            <img src={item.service_image} alt={item.service_name} />
                            <p>{item.service_name}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ExploreService
