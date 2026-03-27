import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';  // import Link for navigation
import { StoreContext } from '../../context/StoreContext';
import './Blog.css';

const Blog = () => {
    const { url } = useContext(StoreContext);
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        fetch(`${url}/blog/list`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setBlogs(data.blogs);
            });
    }, [url]);

    return (
        <div className="blog-container">
            <h1>Our Blog</h1>
            <div className="blog-grid">
                {blogs.map(blog => (
                    <div key={blog._id} className="blog-card">
                        {blog.image && <img src={`${url.replace("/api", "")}${blog.image}`} alt={blog.title} />}
                        <div className="blog-content">
                            <h3>{blog.title}</h3>
                            <p>{blog.content.slice(0, 150)}...</p>
                            <Link to={`/blog/${blog._id}`} className="read-more">READ MORE</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Blog;