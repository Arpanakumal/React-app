import React, { useEffect, useState } from 'react';
import './services.css';
import { upload } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateService = ({ url }) => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);
    const [data, setData] = useState({
        name: "",
        description: "",
        price_info: "",
        category: "",
    });


    const fetchService = async () => {
        try {
            const response = await axios.get(`${url}/api/Service/list`);
            if (response.data.success) {
                const service = response.data.data.find(item => item._id === id);
                if (service) {
                    setData({
                        name: service.name,
                        description: service.description,
                        price_info: service.price_info,
                        category: service.category
                    });
                    setExistingImage(service.image);
                }
            } else {
                toast.error("Failed to load service");
            }
        } catch (error) {
            toast.error("Server error");
        }
    };

    useEffect(() => {
        fetchService();
    }, [id]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("price_info", Number(data.price_info));
        formData.append("category", data.category);
        if (image) formData.append("image", image);

        try {
            const response = await axios.put(`${url}/api/Service/update/${id}`, formData);
            if (response.data.success) {
                toast.success("Service updated successfully");
                navigate("/services/list");
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Update failed");
        }
    };

    return (
        <div className="service-page">
            <div className='add'>
                <form className='flex-col' onSubmit={onSubmitHandler}>
                    <div className='add-img-upload flex-col'>
                        <p>Upload Image</p>
                        <label htmlFor="image">
                            <img
                                src={image ? URL.createObjectURL(image) : existingImage ? `${url}/images/${existingImage}` : upload}
                                alt="Upload Preview"
                                style={{ width: '150px', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                            />
                        </label>
                        <input
                            onChange={(e) => setImage(e.target.files[0])}
                            type="file"
                            id="image"
                            hidden
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
                            <select onChange={onChangeHandler} name="category" value={data.category}>
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

                    <button type='submit' className='add-btn'>UPDATE</button>
                </form>
            </div>
        </div>
    );
};

export default UpdateService;
