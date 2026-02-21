import express from "express";

import { adminLogin ,
    getAdminDashboard,
    markCommissionPaid,
    getPendingCommissions,
    getRevenueReport

} from "../controllers/AdminController.mjs";
import authAdmin from "../middleware/authAdmin.mjs";

const adminRouter = express.Router();

adminRouter.post("/login", adminLogin);
adminRouter.get("/dashboard", authAdmin, getAdminDashboard);
adminRouter.get("/pending-commissions", authAdmin, getPendingCommissions);
adminRouter.post("/mark-commission-paid", authAdmin, markCommissionPaid);
adminRouter.get('/revenue', authAdmin, getRevenueReport);



export default adminRouter;
