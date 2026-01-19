const { PrivateMessage, GroupMessage, User } = require("../models");


// PRIVATE CHAT

exports.sendPrivateMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.userId;

    if (!receiverId || !message) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const roomId =
      senderId < receiverId
        ? `private_${senderId}_${receiverId}`
        : `private_${receiverId}_${senderId}`;

    const savedMessage = await PrivateMessage.create({
      senderId,
      receiverId,
      roomId,
      message,
    });

    res.status(201).json({
      roomId,
      senderId,
      senderName: req.user.name,
      message,
      createdAt: savedMessage.createdAt,
    });
  } catch (error) {
    console.error("Private message failed", error);
    res.status(500).json({ message: "Failed to send private message" });
  }
};



exports.getPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const otherUserId = req.params.userId;

    const messages = await PrivateMessage.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: [
        { model: User, as: "Sender", attributes: ["id", "name"] },
        { model: User, as: "Receiver", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Fetch private messages failed", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};


// GROUP CHAT

exports.sendGroupMessage = async (req, res) => {
  try {
    const { message, groupId } = req.body;
    const senderId = req.user.userId;

    if (!message || !groupId) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const savedMessage = await GroupMessage.create({
      message,
      groupId,
      senderId,
    });

    res.status(201).json({
      groupId,
      senderId,
      senderName: req.user.name,
      message,
      createdAt: savedMessage.createdAt,
    });
  } catch (err) {
    console.error("Group message failed", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};


exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await GroupMessage.findAll({
      where: { groupId },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.status(200).json({ messages });
  } catch (err) {
    console.error("Fetch group messages failed", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};
