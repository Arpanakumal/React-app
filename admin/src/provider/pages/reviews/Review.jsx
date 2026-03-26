import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";


const Review = () => {
    const { providerId } = useParams();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("token");

    const fetchReviews = async (pageNum = 1) => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/provider/${providerId}/reviews`, {
                params: { page: pageNum, limit: 10 },
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                setReviews(res.data.data.reviews);
                setTotalPages(res.data.data.totalPages);
            } else {
                toast.error(res.data.message || "Failed to fetch reviews");
            }
        } catch (err) {
            console.error("Error fetching reviews:", err);
            toast.error("Server error while fetching reviews");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(page);
    }, [page]);

    if (loading) return <p>Loading reviews...</p>;
    if (!reviews.length) return <p>No reviews yet.</p>;

    return (
        <div className="reviews-container">
            <h2>Provider Reviews</h2>
            <table className="reviews-table">
                <thead>
                    <tr>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {reviews.map((r) => (
                        <tr key={r._id}>
                            <td>{'⭐'.repeat(Math.round(r.rating))}</td>
                            <td>{r.comment || "-"}</td>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="pagination">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(prev => prev - 1)}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Review;