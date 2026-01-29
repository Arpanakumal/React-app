import React, { useState } from 'react'
import './services.css';
import { upload } from '../../assets/assets';
import axios from "axios";
import { toast } from 'react-toastify';


const Service = ({ url }) => {


    const [commissionPercent, setCommissionPercent] = useState(0);


    const [image, setImage] = useState(null);

    const [data, setData] = useState({
        name: "",
        description: "",
        price_info: "",
        category: "",
    })

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data => ({ ...data, [name]: value }))
    }

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("commissionPercent", Number(commissionPercent));

        formData.append("name", data.name)
        formData.append("description", data.description)
        formData.append("price_info", Number(data.price_info))
        formData.append("category", data.category)
        formData.append("image", image)

        const response = await axios.post(`${url}/api/Service/add`, formData);
        if (response.data.success) {
            setData({
                name: "",
                description: "",
                price_info: "",
                category: "",

            })
            setImage(false)
            toast.success(response.data.message)

        }
        else {
            toast.error(response.data.message)
        }

    }


    return (
        <div className="service-page">
            <div className='add'>
                <form className='flex-col' onSubmit={onSubmitHandler}>
                    <div className='add-img-upload flex-col'>
                        <p>Upload Image</p>
                        <label htmlFor="image">
                            <img
                                src={image ? URL.createObjectURL(image) : upload}
                                alt="Upload Preview"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                            />
                        </label>
                        <input
                            onChange={(e) => setImage(e.target.files[0])}
                            type="file"
                            id="image"
                            hidden
                            required
                        />
                    </div>

                    <div className="add-service-name flex-col">
                        <p>Service</p>
                        <input onChange={onChangeHandler} value={data.name} type="text" name='name' placeholder='Type here' />
                    </div>


                    <div className="add-service-desc flex-col">
                        <textarea onChange={onChangeHandler} value={data.description} name="description" rows='6' placeholder='Write Content here' required></textarea>
                    </div>

                    <div className="add-category-price_info">
                        <div className="add-category flex-col">
                            <p>Service Category</p>
                            <select onChange={onChangeHandler} name="category">
                                <option value="Cleaning">Cleaning</option>
                                <option value="Interior">Interior</option>
                                <option value="Plumbing">Plumbing</option>
                                <option value="Gardening">Gardening</option>
                                <option value="Electrical">Electrical</option>
                            </select>
                        </div>

                        <div className="add-price_info">
                            <p>Price Information</p>
                            <input onChange={onChangeHandler} value={data.price_info} type="number" name='price_info' placeholder='Rs.' />
                        </div>

                    </div>

                    <button type='submit' className='add-btn'>ADD</button>
                </form>
            </div>
        </div>
    )
}

export default Service;
