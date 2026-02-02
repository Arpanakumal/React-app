import express from "express";
import authmiddleware from '../middleware/authMiddleware.mjs'
import { registerUser, listUsers, deleteUser, updateUser, getUserById,getCurrentUser,toggleUserStatus } from "../controllers/UserController.mjs";

const userRouter = express.Router();


userRouter.post("/register", registerUser);


userRouter.get("/list", listUsers);

userRouter.patch("/:id/toggle", toggleUserStatus);


userRouter.put("/:id/update", updateUser);

userRouter.get("/me",authmiddleware, getCurrentUser);

userRouter.get("/:id", getUserById);



userRouter.delete("/delete/:id", deleteUser);

export default userRouter;
