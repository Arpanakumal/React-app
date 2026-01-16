import ServiceModel from "../models/ServiceModel.mjs";
import fs from "fs";


const addService = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required"
            });
        }

        const image_filename = req.file.filename;

        const service = new ServiceModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            price_info: req.body.price_info,
            category: req.body.category,
            image: image_filename
        });

        await service.save();

        res.status(201).json({
            success: true,
            message: "Service added successfully",
            service
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error adding service"
        });
    }
};

export { addService };
