import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./Detail.css";

const API_URL = "http://localhost:3001/api/blog";
const token = localStorage.getItem("user_token");

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [reply, setReply] = useState("");
    const [comments, setComments] = useState([]);

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`${API_URL}/list`);
            const data = await res.json();

            if (data.success) {
                const foundBlog = data.blogs.find((b) => b._id === id);
                if (foundBlog) {
                    setBlog(foundBlog);
                    setComments(foundBlog.comments || []);
                }
            }
        } catch (err) {
            console.error("Error fetching blog:", err);
        }
    };

    const formatContent = (text) => {
        return text
            .split(". ")
            .reduce((acc, sentence, index) => {
                const paraIndex = Math.floor(index / 3);
                if (!acc[paraIndex]) acc[paraIndex] = "";
                acc[paraIndex] += sentence + ". ";
                return acc;
            }, []);
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();

        if (!reply.trim()) {
            toast.error("Reply cannot be empty");
            return;
        }

        try {
            const res = await fetch(`${API_URL}/comment/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text: reply }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Reply added!");
                setReply("");
                setComments((prev) => [...prev, data.comment]);
            } else {
                toast.error(data.message || "Failed to add reply");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error");
        }
    };

    if (!blog) return <p>Loading...</p>;

    return (
        <div className="blog-detail-container">
            <h1 className="blog-title">{blog.title}</h1>

            {blog.image && (
                <img
                    className="blog-image"
                    src={`http://localhost:3001${blog.image}`}
                    alt={blog.title}
                />
            )}

            <div className="blog-text">
                {formatContent(blog.content).map((para, i) => (
                    <p key={i}>{para}</p>
                ))}
            </div>

            <hr />
            <p className="blog-meta">
                Written by{" "}
                <strong>
                    {blog.authorName || blog.author?.name || "Unknown"}
                </strong>
            </p>

            <p className="blog-date">
                {formatDate(blog.createdAt)}
            </p>

            <h3>Comments</h3>

            {comments.length === 0 && (
                <p>No comments yet. Be the first to reply!</p>
            )}

            <ul className="comment-list">
                {comments.map((comment) => (
                    <li key={comment._id} className="comment-item">
                        <strong>{comment.userName || "Anonymous"}:</strong>
                        <p>{comment.text}</p>
                    </li>
                ))}
            </ul>

            {token ? (
                <form onSubmit={handleReplySubmit} className="comment-form">
                    <textarea
                        placeholder="Write your reply here..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={4}
                    />
                    <button type="submit">Submit Reply</button>
                </form>
            ) : (
                <p>You must be logged in to post a reply.</p>
            )}
        </div>
    );
};

export default BlogDetail;