import express from "express";
import authmiddleware from '../middleware/authMiddleware.mjs';

import { registerUser, listUsers, deleteUser, updateUser, getUserById, getCurrentUser, toggleUserStatus, loginUser } from "../controllers/UserController.mjs";

const userRouter = express.Router();


userRouter.post("/register", registerUser);

userRouter.post("/login",loginUser);


userRouter.get("/list", listUsers);

userRouter.patch("/:id/toggle", toggleUserStatus);




userRouter.get("/me", authmiddleware, getCurrentUser);

userRouter.get("/:id", getUserById);

userRouter.put("/:id/update", updateUser);


userRouter.delete("/delete/:id", deleteUser);

export default userRouter;
