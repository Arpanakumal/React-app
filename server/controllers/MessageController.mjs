
import Message from "../models/MessageModel.mjs";


export const createMessage = async (req, res) => {
    try {
        const { name, email, message, userId } = req.body;

        const newMsg = new Message({
            name,
            email,
            message,
            userId: userId || null,
        });

        await newMsg.save();
        res.json({ success: true, data: newMsg });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};


export const getMessages = async (req, res) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');
        res.json({ success: true, data: messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        if (!message) return res.status(404).json({ success: false, message: "Message not found" });

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Message.countDocuments({ read: false });
        res.json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        if (!message) return res.status(404).json({ success: false, message: "Message not found" });
        res.json({ success: true, data: message });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
