import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './details.css'

const API_URL = "http://localhost:3001/api/blog";
const token = localStorage.getItem("token");

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`${API_URL}/list`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (data.success) {
                const foundBlog = data.blogs.find((b) => b._id === id);
                setBlog(foundBlog);
            }
        } catch (err) {
            console.error("Error fetching blog:", err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;
        try {
            const res = await fetch(`${API_URL}/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Blog deleted successfully!");
                navigate("/blog");
            } else {
                toast.error(data.message || "Error deleting blog");
            }
        } catch (err) {
            console.error("Error deleting blog:", err);
            toast.error("Server error, try again.");
        }
    };

    const handleEdit = () => {
        navigate(`/blogs/edit/${id}`);
    };

    if (!blog) return <p>Loading...</p>;

    return (
        <div className="blog-details">
            {blog.image && <img src={`http://localhost:3001${blog.image}`} alt={blog.title} />}
            <div className="content">
                <h2>{blog.title}</h2>
                <p>{blog.content}</p>
                <div className="actions">
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleDelete}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default BlogDetails;