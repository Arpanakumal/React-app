import express from "express";
import {  loginAll } from "../controllers/AdminController.mjs";


const adminRouter = express.Router();



// Unified login for admin, provider, customer
adminRouter.post("/login", loginAll);

export default adminRouter;
