import ServiceModel from "../models/ServiceModel.mjs";
import fs from "fs";


const addService = async (req, res) => {
    try {
        console.log("Body:", req.body);
        console.log("File:", req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required"
            });
        }

        const existingService = await ServiceModel.findOne({
            name: req.body.name,
            category: req.body.category
        });

        if (existingService) {
            return res.status(409).json({
                success: false,
                message: "Service already exists"
            });
        }

        const service = new ServiceModel({
            name: req.body.name,
            description: req.body.description,
            price_info: req.body.price_info,
            category: req.body.category,
            image: req.file.filename
        });

        await service.save();

        res.status(201).json({
            success: true,
            message: "Service added successfully",
            service
        });

    } catch (error) {
        console.error("Error in addService:", error);
        res.status(500).json({
            success: false,
            message: "Error adding service",
            error: error.message
        });
    }
};



//all service list
const listService = async (req, res) => {
    try {

        const Services = await ServiceModel.find({});
        res.json({ success: true, data: Services })

    } catch (error) {

        console.log(error);
        res.json({ succes: false, message: "Error" })

    }

}

//update
const updateService = async (req, res) => {
    try {
        const { id } = req.params;

        const service = await ServiceModel.findById(id);
        if (!service) return res.status(404).json({ success: false, message: "Service not found" });

        service.name = req.body.name || service.name;
        service.description = req.body.description || service.description;
        service.price_info = req.body.price_info || service.price_info;
        service.category = req.body.category || service.category;

        if (req.file) {
            // Delete old image
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


//remove services
const removeService = async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Service ID is required"
            });
        }

        const service = await ServiceModel.findById(id);
        if (!service) {
            return res.status(404).json({
                success: false,
                message: "Service not found"
            });
        }

        const imagePath = `uploads/${service.image}`;
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }


        await ServiceModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Service Removed"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error removing service"
        });
    }
};


export { addService, listService, removeService,updateService };
