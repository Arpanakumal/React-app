import express from "express";
import { addProvider } from "../controllers/ProviderController.mjs";

const providerRouter = express.Router();


providerRouter.post("/add/provider", addProvider);

export default providerRouter;
