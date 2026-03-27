import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './display.css';

const API_URL = "http://localhost:3001/api/blog";
const token = localStorage.getItem("token");

const DisplayBlog = () => {
    const [blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch(`${API_URL}/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) setBlogs(data.blogs);
        } catch (err) {
            console.error("Error fetching blogs:", err);
        }
    };

    return (
        <div className="display-blog">
            <h2>Blogs</h2>
            <div className="blog-grid" style={{ display: "flex", flexWrap: "wrap" }}>
                {blogs.map((blog) => (
                    <img
                        key={blog._id}
                        src={`http://localhost:3001${blog.image}`}
                        alt={blog.title}
                        className="blog-thumbnail"
                        style={{ width: "150px", height: "150px", cursor: "pointer", objectFit: "cover", margin: "5px" }}
                        onClick={() => navigate(`/blog/${blog._id}`)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default DisplayBlog;