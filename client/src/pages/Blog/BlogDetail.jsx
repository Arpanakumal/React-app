import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import './Detail.css';

const API_URL = "http://localhost:3001/api/blog";
const token = localStorage.getItem("user_token");

const BlogDetail = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [reply, setReply] = useState("");
    const [comments, setComments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const fetchBlog = async () => {
        try {
            const res = await fetch(`${API_URL}/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
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
                // Refresh comments list
                setComments((prev) => [...prev, data.comment]);
            } else {
                toast.error(data.message || "Failed to add reply");
            }
        } catch (err) {
            console.error("Error posting reply:", err);
            toast.error("Server error, try again.");
        }
    };

    if (!blog) return <p>Loading...</p>;

    return (
        <div className="blog-detail-container">
            <h2>{blog.title}</h2>
            {blog.image && (
                <img src={`http://localhost:3001${blog.image}`} alt={blog.title} />
            )}
            <p>{blog.content}</p>

            <hr />

            <h3>Comments</h3>
            {comments.length === 0 && <p>No comments yet. Be the first to reply!</p>}
            <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                {comments.map((comment) => (
                    <li
                        key={comment._id}
                        style={{
                            borderBottom: "1px solid #ddd",
                            padding: "10px 0",
                        }}
                    >
                        <strong>{comment.userName || "Anonymous"}:</strong> {comment.text}
                    </li>
                ))}
            </ul>

            {token ? (
                <form onSubmit={handleReplySubmit} style={{ marginTop: "20px" }}>
                    <textarea
                        placeholder="Write your reply here..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={4}
                        style={{ width: "100%", padding: "10px" }}
                    />
                    <button type="submit" style={{ marginTop: "10px" }}>
                        Submit Reply
                    </button>
                </form>
            ) : (
                <p>You must be logged in to post a reply.</p>
            )}
        </div>
    );
};

export default BlogDetail;