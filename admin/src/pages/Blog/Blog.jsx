import React, { useState, useEffect } from 'react';
import './blog.css';
import { toast } from "react-toastify";

const API_URL = "http://localhost:3001/api/blog";
const token = localStorage.getItem("token");

const Blog = () => {
    const [blogs, setBlogs] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            const res = await fetch(`${API_URL}/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) setBlogs(data.blogs);
        } catch (err) {
            console.error("Error fetching blogs:", err);
        }
    };

    const handleAddOrUpdate = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("content", content);
        if (image) formData.append("image", image);

        let endpoint = `${API_URL}/add`;
        let method = "POST";
        let action = "added";

        if (editingId) {
            endpoint = `${API_URL}/update/${editingId}`;
            method = "PUT";
            action = "updated";
        }

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                toast.success(`Blog ${action} successfully!`);
                fetchBlogs();
                setTitle("");
                setContent("");
                setImage(null);
                setEditingId(null);
            } else {
                toast.error(data.message || `Error ${action} blog`);
            }
        } catch (err) {
            console.error("Error in handleAddOrUpdate:", err);
            toast.error("Server error, try again.");
        }
    };




    return (
        <div className="admin-blog">
            <h1>Manage Blogs</h1>

            <div className="blog-form">
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                />
                <input
                    type="file"
                    onChange={e => setImage(e.target.files[0])}
                />
                <button onClick={handleAddOrUpdate}>
                    {editingId ? "Update Blog" : "Add Blog"}
                </button>
            </div>


        </div>
    );
};

export default Blog;