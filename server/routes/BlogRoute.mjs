import express from "express";
import multer from "multer";
import authAdmin from "../middleware/authAdmin.mjs";
import { createBlog, listBlogs, updateBlog, deleteBlog, addComment } from "../controllers/BlogController.mjs";

const blogRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });


blogRouter.post("/add", authAdmin, upload.single("image"), createBlog);
blogRouter.put("/update/:id", authAdmin, upload.single("image"), updateBlog);
blogRouter.delete("/delete/:id", authAdmin, deleteBlog);
blogRouter.post("/comment/:id", addComment);

blogRouter.get("/list", listBlogs);

export default blogRouter;