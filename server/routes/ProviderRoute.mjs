import express from "express";
import { listProviders, createProvider } from "../controllers/ProviderController.mjs";

const providerRouter = express.Router();

providerRouter.get("/list", listProviders);
providerRouter.post("/create", createProvider);

export default providerRouter;
