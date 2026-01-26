import express from "express";
import multer from "multer";
import { addService, listService, updateService, removeService } from "../controllers/ServiceController.mjs";

const router = express.Router();

// Image upload setup
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

router.post("/add", upload.single("image"), addService);
router.get("/list", listService);
router.put("/update/:id", upload.single("image"), updateService);
router.post("/remove", removeService);

export default router;
