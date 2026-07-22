import express from "express";
import upload from "../middleware/multer.mjs";
import authAdmin from "../middleware/authAdmin.mjs";
import { createBlog, listBlogs, updateBlog, deleteBlog, addComment } from "../controllers/BlogController.mjs";

const blogRouter = express.Router();



blogRouter.post("/add", authAdmin, upload.single("image"), createBlog);
blogRouter.put("/update/:id", authAdmin, upload.single("image"), updateBlog);
blogRouter.delete("/delete/:id", authAdmin, deleteBlog);
blogRouter.post("/comment/:id", addComment);

blogRouter.get("/list", listBlogs);

export default blogRouter;