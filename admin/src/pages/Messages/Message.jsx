import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import './messages.css';

const AdminMessages = ({ url }) => {
    const API_URL = url || import.meta.env.VITE_API_URL;

    const [messages, setMessages] = useState([]);
    const [filteredMessages, setFilteredMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [unreadMessages, setUnreadMessages] = useState(0);


    const fetchMessages = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            if (!token) return toast.error("Admin not logged in");

            const res = await axios.get(`${API_URL}/api/messages`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setMessages(res.data.data);
                setFilteredMessages(res.data.data);


                const unreadCount = res.data.data.filter(msg => !msg.read).length;
                setUnreadMessages(unreadCount);
            } else {
                toast.error(res.data.message || "Failed to fetch messages");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error while fetching messages");
        } finally {
            setLoading(false);
        }
    };


    const handleSelectMessage = async (msg) => {
        setSelectedMessage(msg);

        if (!msg.read) {
            try {
                const token = localStorage.getItem("token");
                await axios.put(`${API_URL}/api/messages/${msg._id}/read`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });

 
                setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));
                setFilteredMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m));

                setUnreadMessages(prev => Math.max(prev - 1, 0));
            } catch (err) {
                console.error("Failed to mark message as read", err);
                toast.error("Could not mark message as read");
            }
        }
    };


    const deleteMessage = async (id) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;

        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(`${API_URL}/api/messages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                toast.success("Message deleted");
                const updatedMessages = messages.filter(msg => msg._id !== id);
                setMessages(updatedMessages);
                setFilteredMessages(updatedMessages);
                if (selectedMessage?._id === id) setSelectedMessage(null);

                const unreadCount = updatedMessages.filter(msg => !msg.read).length;
                setUnreadMessages(unreadCount);
            } else {
                toast.error(res.data.message || "Failed to delete message");
            }
        } catch (err) {
            console.error(err);
            toast.error("Server error while deleting message");
        }
    };

    // Search by name or email
    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const filtered = messages.filter(msg =>
            (msg.name?.toLowerCase().includes(term) || msg.email?.toLowerCase().includes(term))
        );
        setFilteredMessages(filtered);
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    if (loading) return <p>Loading messages...</p>;

    return (
        <div className="messages-container">
            <h2>Admin Messages</h2>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <table className="messages-table">
                <thead>
                    <tr>
                        <th>From</th>
                        <th>Email</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredMessages.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: "center" }}>No messages found.</td>
                        </tr>
                    ) : (
                        filteredMessages.map(msg => (
                            <tr
                                key={msg._id}
                                className={selectedMessage?._id === msg._id ? "active-row" : ""}
                                onClick={() => handleSelectMessage(msg)}
                            >
                                <td>{msg.name || "Unknown"}</td>
                                <td>{msg.email || "-"}</td>
                                <td>{new Date(msg.createdAt).toLocaleString()}</td>
                                <td>{msg.read ? "Read" : "Unread"}</td>
                                <td>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => { e.stopPropagation(); deleteMessage(msg._id); }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedMessage && (
                <div className="message-detail">
                    <h3>Message Detail</h3>
                    <p><strong>From:</strong> {selectedMessage.name || "Unknown"} ({selectedMessage.email || "-"})</p>
                    <p><strong>Message:</strong></p>
                    <p className="message-body">{selectedMessage.message}</p>
                    <p><strong>Date:</strong> {new Date(selectedMessage.createdAt).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default AdminMessages;
