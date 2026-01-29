const { PrivateMessage, GroupMessage, User, ArchivedPrivateMessage, ArchivedGroupMessage } = require("../models");
const { Op } = require("sequelize");


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
      status: "sent"
    });

    res.status(201).json({
      roomId,
      senderId,
      senderName: req.user.name,
      message,
      status: savedMessage.status,
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
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      attributes: [
        "id",
        "message",
        "mediaUrl",
        "mediaType",
        "createdAt",
        "senderId",
        "receiverId",
        "status"
      ],
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

//load Older Private messages

exports.loadOlderPrivateMessages = async (req, res) => {
  try {
    const userId = req.user.userId;
    const otherUserId = req.params.userId;
    const { before } = req.query; // timestamp
    const limit = 20;

    const whereCondition = {
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      createdAt: { [Op.lt]: new Date(before) },
    };

    // Try hot table first
    let messages = await PrivateMessage.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "message",
        "mediaUrl",
        "mediaType",
        "createdAt",
        "senderId",
        "receiverId",
        "status"
      ],
      order: [["createdAt", "DESC"]],
      limit,
    });

    // If not enough → pull from archive
    if (messages.length < limit) {
      const remaining = limit - messages.length;

      const archived = await ArchivedPrivateMessage.findAll({
        where: whereCondition,
        attributes: [
          "id",
          "message",
          "mediaUrl",
          "mediaType",
          "createdAt",
          "senderId",
          "receiverId",
          "status"
        ],
        order: [["createdAt", "DESC"]],
        limit: remaining,
      });

      messages = [...messages, ...archived];
    }

    res.status(200).json({
      messages: messages.reverse(), // oldest → newest
      hasMore: messages.length === limit,
    });
  } catch (err) {
    console.error("Load older private messages failed", err);
    res.status(500).json({ message: "Failed to load messages" });
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

exports.loadOlderGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { before } = req.query;
    const limit = 20;

    let messages = await GroupMessage.findAll({
      where: {
        groupId,
        createdAt: { [Op.lt]: new Date(before) },
      },
      order: [["createdAt", "DESC"]],
      limit,
    });

    if (messages.length < limit) {
      const remaining = limit - messages.length;

      const archived = await ArchivedGroupMessage.findAll({
        where: {
          groupId,
          createdAt: { [Op.lt]: new Date(before) },
        },
        order: [["createdAt", "DESC"]],
        limit: remaining,
      });

      messages = [...messages, ...archived];
    }

    res.status(200).json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (err) {
    console.error("Load older group messages failed", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};
