import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const BlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String },
    author: { type: String, default: "Admin" },
    createdAt: { type: Date, default: Date.now },

    comments: [CommentSchema]  
});

export default mongoose.model("Blog", BlogSchema);