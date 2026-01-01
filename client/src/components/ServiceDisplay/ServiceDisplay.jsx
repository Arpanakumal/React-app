import React, { useContext, useState } from 'react'
import { StoreContext } from '../../context/StoreContext'
import './ServiceDisplay.css'
import { Service_list } from '../../assets/assets'

const ServiceDisplay = (category) => {


    const { Service_list } = useContext(StoreContext)


return (
    <div className='service-display' id='service-display'>
        <h2>Professionals near you</h2>
    </div>
)
}


export default ServiceDisplay