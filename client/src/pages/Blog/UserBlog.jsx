import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import './Userblog.css';

const UserBlog = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !content) {
            toast.error("Title and content are required");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            if (image) formData.append("image", image);

            const res = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/blog/add`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("user_token")}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (res.data.success) {
                toast.success("Blog created successfully!");
                navigate("/blog");
            } else {
                toast.error(res.data.message || "Failed to create blog");
            }

        } catch (error) {
            console.error(error);
            toast.error("Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="write-blog-container">
            <h2>Write a Blog</h2>

            <form onSubmit={handleSubmit} className="write-blog-form">

                <input
                    type="text"
                    placeholder="Blog Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                    placeholder="Write your content here..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="10"
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Publishing..." : "Publish Blog"}
                </button>

            </form>
        </div>
    );
};

export default UserBlog;