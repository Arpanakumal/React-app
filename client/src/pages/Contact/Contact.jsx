import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Contact.css";
import * as assets from "../../assets/assets";

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [user, setUser] = useState({ id: "", name: "", email: "" });
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.REACT_APP_API_URL; // e.g., http://localhost:3001
    const token = localStorage.getItem("token");


    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;
            try {
                const { data } = await axios.get(`${API_URL}/api/user/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (data.success) {
                    setUser({ id: data.data._id, name: data.data.name, email: data.data.email });
                    setForm(prev => ({
                        ...prev,
                        name: data.data.name,
                        email: data.data.email,
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch user:", err);
            }
        };
        fetchUser();
    }, [token, API_URL]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) {
            toast.error("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(
                `${API_URL}/api/messages`,
                {
                    ...form,
                    userId: user.id || null,
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );

            if (res.data.success) {
                toast.success("Message sent successfully!");
                setForm({ name: user.name || "", email: user.email || "", message: "" });
            } else {
                toast.error(res.data.message || "Failed to send message");
            }
        } catch (err) {
            console.error("Error sending message:", err);
            toast.error(err.response?.data?.message || "Server error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            <div className="text-2xl text-center pt-8 border-t">
                <h1>Contact Us</h1>
            </div>

            <div className="contact-container">
                <div className="contact-image">
                    <img src={assets.contact} alt="Contact Us" />
                </div>

                <div className="contact-form">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Your Name"
                                required
                                readOnly={!!user.id}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Your Email"
                                required
                                readOnly={!!user.id} 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Your Message"
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
