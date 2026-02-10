import express from "express";
import { adminLogin } from "../controllers/AdminController.mjs";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);

export default adminRouter;
