import React, { useEffect, useState } from 'react';
import './list.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const List = ({ url }) => {

    const navigate = useNavigate();

    const [list, setList] = useState([]);

    const fetchList = async () => {
        try {
            const response = await axios.get(`${url}/api/Service/list`);
            if (response.data.success) {
                setList(response.data.data);
            } else {
                toast.error("Error fetching services");
            }
        } catch (error) {
            toast.error("Server error");
        }
    };


    const removeService = async (serviceId) => {


        try {
            const response = await axios.post(`${url}/api/Service/remove`, {
                id: serviceId
            });

            if (response.data.success) {
                toast.success("Service Removed");

            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    useEffect(() => {
        fetchList();
    }, []);

    return (
        <div className="list-container">
            <p className="list-title">All Services</p>

            <div className="list-table">
                <div className="list-table-format title">
                    <b>Image</b>
                    <b>Name</b>
                    <b>Category</b>
                    <b>Price Information</b>
                    <b>Action</b>
                </div>

                {list.map((item) => (
                    <div key={item._id} className="list-table-format">
                        <img src={`${url}/images/${item.image}`} alt="" />
                        <p>{item.name}</p>
                        <p>{item.category}</p>
                        <p>{item.price_info}</p>

                        <div className="action-btns">
                            <button onClick={() => navigate(`/services/update/${item._id}`)} className="edit-btn">Edit</button>
                            <button
                                onClick={() => removeService(item._id)}
                                className="delete-btn"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default List;
