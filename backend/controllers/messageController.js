const Message = require("../models/message");

exports.sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.userId;

        if (!message) {
            return res.status(400).json({ message: "Message is required" });
        }

        const savedMessage = await Message.create({
            message,
            UserId: userId,
        });

        res.status(201).json({
            success: true,
            message: savedMessage,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save message" })
    }
};