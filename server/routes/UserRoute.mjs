import express from "express";
import { registerUser } from "../controllers/UserController.mjs";

const userRouter = express.Router();

// Register customer
userRouter.post("/register", registerUser);



export default userRouter;
