import React, { useEffect, useState } from "react";
import axios from "axios";
import './profile.css';

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Profile = ({ url }) => {
    const token = localStorage.getItem("pToken");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        image: null,
    });

    const [availability, setAvailability] = useState({
        workingDays: [],
        startTime: "",
        endTime: "",
        isAvailable: true
    });

    const [loading, setLoading] = useState(false);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(`${url}/api/provider/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.success) {
                const provider = res.data.data;
                setFormData({
                    name: provider.name || "",
                    email: provider.email || "",
                    phone: provider.phone || "",
                    password: "",
                    image: null,
                });


                if (provider.availability) {
                    setAvailability({
                        workingDays: provider.availability.workingDays || [],
                        startTime: provider.availability.startTime || "",
                        endTime: provider.availability.endTime || "",
                        isAvailable: provider.availability.isAvailable ?? true
                    });
                }
            }
        } catch (err) {
            console.error("Fetch profile error:", err);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setFormData({ ...formData, [name]: files[0] });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleDayChange = (e) => {
        const day = e.target.value;
        setAvailability(prev => {
            const days = prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day];
            return { ...prev, workingDays: days };
        });
    };


    const saveAvailability = async () => {
        try {
            const res = await axios.put(
                `${url}/api/provider/availability`,
                availability,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                alert("Availability updated successfully");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to update availability");
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            if (formData.password) data.append("password", formData.password);
            if (formData.image) data.append("image", formData.image);

            const res = await axios.put(`${url}/api/provider/profile`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                alert("Profile updated successfully");
            }
        } catch (err) {
            console.error("Update profile error:", err);
            alert("Profile update failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-container">
            <h2>Update Profile</h2>
            <form onSubmit={handleSubmit} className="profile-form">

                <div className="form-group">
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>New Password (optional)</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Profile Image</label>
                    <input type="file" name="image" onChange={handleChange} accept="image/*" />
                </div>

                <div className="availability-section">
                    <h3>Availability</h3>
                    <div className="days-checkboxes">
                        {weekdays.map(day => (
                            <label key={day}>
                                <input
                                    type="checkbox"
                                    value={day}
                                    checked={availability.workingDays.includes(day)}
                                    onChange={handleDayChange}
                                />
                                {day}
                            </label>
                        ))}
                    </div>

                    <div className="time-group">
                        <label>Start Time</label>
                        <input
                            type="time"
                            value={availability.startTime || ""}
                            onChange={e => setAvailability({ ...availability, startTime: e.target.value })}
                        />
                    </div>

                    <div className="time-group">
                        <label>End Time</label>
                        <input
                            type="time"
                            value={availability.endTime || ""}
                            onChange={e => setAvailability({ ...availability, endTime: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label>Available</label>
                        <input
                            type="checkbox"
                            checked={availability.isAvailable}
                            onChange={e => setAvailability({ ...availability, isAvailable: e.target.checked })}
                        />
                    </div>

                    <button type="button" onClick={saveAvailability} className="btn">Save Availability</button>
                </div>

                <button type="submit" disabled={loading} className="btn">
                    {loading ? "Updating..." : "Update Profile"}
                </button>
            </form>
        </div>
    );
};

export default Profile;
