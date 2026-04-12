import ServiceModel from "../models/ServiceModel.mjs";
import fs from "fs";
import mongoose from "mongoose";


export const addService = async (req, res) => {
    try {
        const { name, description, price_info, category, commissionPercent } = req.body;

        if (!name || !category || !price_info) {
            return res.status(400).json({
                success: false,
                message: "Name, category and price are required"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required"
            });
        }

        const existingService = await ServiceModel.findOne({
            name: name.trim(),
            category: category.trim()
        });

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service already exists"
            });
        }

        const service = await ServiceModel.create({
            name: name.trim(),
            description: description?.trim() || "",
            price_info: Number(price_info),
            category: category.trim(),
            commissionPercent: commissionPercent ? Number(commissionPercent) : 10,
            image: `/uploads/${req.file.filename}`
        });

        res.status(201).json({
            success: true,
            message: "Service added successfully",
            data: service
        });

    } catch (error) {
        console.error("Add service error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const listService = async (req, res) => {
    try {
        const services = await ServiceModel.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: services
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error fetching services"
        });
    }
};

export const updateService = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const service = await ServiceModel.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        const { name, description, price_info, category, commissionPercent } = req.body;

        if (name) service.name = name.trim();
        if (description) service.description = description.trim();
        if (price_info) service.price_info = Number(price_info);
        if (category) service.category = category.trim();
        if (commissionPercent !== undefined)
            service.commissionPercent = Number(commissionPercent);

        if (req.file) {
            if (service.image) {
                const oldImage = service.image.replace("/uploads/", "uploads/");
                if (fs.existsSync(oldImage)) {
                    fs.unlinkSync(oldImage);
                }
            }

            service.image = `/uploads/${req.file.filename}`;
        }

        await service.save();

        res.json({
            success: true,
            message: "Service updated successfully",
            data: service
        });

    } catch (error) {
        console.error("Update service error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const removeService = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid service ID"
            });
        }

        const service = await ServiceModel.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        if (service.image) {
            const imagePath = service.image.replace("/uploads/", "uploads/");
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await ServiceModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Service removed successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const searchService = async (req, res) => {
    try {
        const query = req.query.q?.trim() || "";

        const services = await ServiceModel.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } }
            ]
        }).limit(20);

        res.json({
            success: true,
            data: services
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error searching services"
        });
    }
};