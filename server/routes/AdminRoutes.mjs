import express from "express";

import { adminLogin ,
    getAdminDashboard

} from "../controllers/AdminController.mjs";
import authAdmin from "../middleware/authAdmin.mjs";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/dashboard", authAdmin, getAdminDashboard);


export default adminRouter;
