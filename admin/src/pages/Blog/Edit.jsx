import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './edit.css';

const API_URL = "http://localhost:3001/api/blog";
const token = localStorage.getItem("token");

const Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(null);

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`${API_URL}/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                const blog = data.blogs.find(b => b._id === id);
                if (blog) {
                    setTitle(blog.title);
                    setContent(blog.content);
                    setExistingImage(blog.image);
                } else {
                    alert("Blog not found");
                    navigate("/blogs");
                }
            }
        } catch (err) {
            console.error("Error fetching blog:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (image) formData.append("image", image);

            const res = await fetch(`${API_URL}/update/${id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                toast.success("Blog updated successfully!");
                navigate(`/blog/${id}`);
            } else {
                toast.error(data.message || "Error updating blog");
            }
        } catch (err) {
            console.error("Error updating blog:", err);
            toast.error("Server error, try again.");
        }
    };

    return (
        <div className="edit-blog-container">
            <h2>Edit Blog</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={6} required />
                <div>
                    {existingImage && !image && (
                        <div style={{ marginBottom: "10px" }}>
                            <p>Current Image:</p>
                            <img src={`http://localhost:3001${existingImage}`} alt="current" />
                        </div>
                    )}
                    <input type="file" onChange={e => setImage(e.target.files[0])} />
                </div>
                <button type="submit">Update Blog</button>
            </form>
        </div>
    );
};

export default Edit;