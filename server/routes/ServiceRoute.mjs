import express from "express";
import upload from "../middleware/multer.mjs"   // <-- import your Cloudinary upload middleware

import {
    addService,
    listService,
    updateService,
    removeService,
    searchService
} from "../controllers/ServiceController.mjs";

const router = express.Router();

router.post("/add", upload.single("image"), addService);

router.get("/list", listService);

router.put("/update/:id", upload.single("image"), updateService);

router.post("/remove", removeService);

router.get("/search", searchService);

export default router;