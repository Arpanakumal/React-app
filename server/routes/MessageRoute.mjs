
import express from "express";
import authmiddleware from "../middleware/authMiddleware.mjs";
import { createMessage, getMessages,deleteMessage, getUnreadCount,markAsRead } from "../controllers/MessageController.mjs";
import authAdmin from "../middleware/authAdmin.mjs";

const router = express.Router();


router.post("/", authmiddleware,createMessage);


router.get("/", authmiddleware,getMessages);

router.delete("/:id", authAdmin, deleteMessage);
router.get("/unread-count", authAdmin, getUnreadCount);
router.put("/:id/read", authAdmin, markAsRead);


export default router;
