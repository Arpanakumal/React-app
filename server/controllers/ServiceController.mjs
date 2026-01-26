import ServiceModel from "../models/ServiceModel.mjs";
import fs from "fs";

// Add service
const addService = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Image file is required" });
        }

        const { name, description, price_info, category, commissionPercent } = req.body;

        const existingService = await ServiceModel.findOne({ name, category });
        if (existingService) {
            return res.status(409).json({ success: false, message: "Service already exists" });
        }

        const service = new ServiceModel({
            name,
            description,
            price_info,
            category,
            commissionPercent: commissionPercent || 10,
            image: req.file.filename
        });

        await service.save();

        res.status(201).json({ success: true, message: "Service added successfully", service });

    } catch (error) {
        console.error("Error in addService:", error);
        res.status(500).json({ success: false, message: "Error adding service", error: error.message });
    }
};

// List all services
const listService = async (req, res) => {
    try {
        const services = await ServiceModel.find({});
        res.json({ success: true, data: services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error fetching services" });
    }
};

// Update service
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await ServiceModel.findById(id);
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });

        const { name, description, price_info, category, commissionPercent } = req.body;

        service.name = name || service.name;
        service.description = description || service.description;
        service.price_info = price_info || service.price_info;
        service.category = category || service.category;
        service.commissionPercent = commissionPercent || service.commissionPercent;

        if (req.file) {
            const oldImage = `uploads/${service.image}`;
            if (fs.existsSync(oldImage)) fs.unlinkSync(oldImage);
            service.image = req.file.filename;
        }

        await service.save();
        res.json({ success: true, message: "Service updated", service });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error updating service" });
    }
};

// Remove service
const removeService = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ success: false, message: "Service ID is required" });

        const service = await ServiceModel.findById(id);
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });

        const imagePath = `uploads/${service.image}`;
        if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

        await ServiceModel.findByIdAndDelete(id);

        res.json({ success: true, message: "Service removed" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Error removing service" });
    }
};

export { addService, listService, updateService, removeService };
