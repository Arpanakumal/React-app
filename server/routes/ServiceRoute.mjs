import express from "express";
import multer from "multer";
import { addService } from "../controllers/ServiceController.mjs";

const router = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.post("/add", upload.single("image"), addService);

export default router;
