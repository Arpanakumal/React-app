import Blog from "../models/BlogModel.mjs";
import fs from "fs";


export const createBlog = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title & content required"
            });
        }

        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const blog = new Blog({
            title,
            content,
            image,
            author: {
                id: req.user.id,
                name: req.user.name
            }
        });

        await blog.save();

        res.status(201).json({
            success: true,
            blog
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


export const listBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find()
            .populate("author", "name")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            blogs
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



export const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        if (blog.image) {
            const imagePath = blog.image.replace("/uploads/", "uploads/");
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Blog.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Blog deleted"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;

        if (req.file) {
            if (blog.image) {
                const oldImagePath = blog.image.replace("/uploads/", "uploads/");
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            blog.image = `/uploads/${req.file.filename}`;
        }

        await blog.save();

        res.json({
            success: true,
            blog
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                success: false,
                message: "Comment text required"
            });
        }

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found"
            });
        }

        const newComment = {
            text,
            userName: req.user?.name || "Anonymous",
            userId: req.user?.id || null,
            createdAt: new Date()
        };


        blog.comments.push(newComment);



        await blog.save();

        res.status(201).json({
            success: true,
            comment: newComment
        });

    } catch (err) {
        console.error("ADD COMMENT ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};