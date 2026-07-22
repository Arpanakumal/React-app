import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.mjs";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "homeease",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "jfif"],
        public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    }),
});

const fileFilter = (req, file, cb) => {
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "jfif", "gif", "bmp", "tiff"];
    const extension = file.originalname.split('.').pop().toLowerCase();

    if (file.mimetype?.startsWith("image/") || allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
});

export default upload;