import express from "express";
import { registerUser,listUsers,deleteUser,toggleUserStatus } from "../controllers/UserController.mjs";

const userRouter = express.Router();

// Register customer
userRouter.post("/register", registerUser);

// Get all users (for admin)
userRouter.get("/list", listUsers);

// Toggle active/inactive status
userRouter.patch("/:id/toggle", toggleUserStatus);

// Delete user
userRouter.delete("/delete/:id", deleteUser);

export default userRouter;
