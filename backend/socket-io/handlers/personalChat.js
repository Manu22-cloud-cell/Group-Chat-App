const { PrivateMessage } = require("../../models");

module.exports = (io, socket) => {

  socket.on("join_private", async ({ roomId }) => {
    socket.join(roomId);

    const updated = await PrivateMessage.findAll({
      where: {
        roomId,
        receiverId: socket.user.userId,
        status: "sent"
      },
      attributes: ["id"]
    });

    const messageIds = updated.map(m => m.id);

    await PrivateMessage.update(
      { status: "delivered" },
      {
        where: { id: messageIds }
      }
    );

    socket.to(roomId).emit("messages_delivered", { messageIds });

  });

  socket.on(
    "send_private_message",
    async ({ roomId, receiverId, message, mediaUrl, mediaType, clientTempId }) => {
      if (!roomId || !receiverId) return;
      if (!message && !mediaUrl) return;

      const roomSockets = await io.in(roomId).fetchSockets();
      const receiverIsOnlineInRoom = roomSockets.some(
        s => s.user.userId === receiverId
      );

      const savedMsg = await PrivateMessage.create({
        roomId,
        senderId: socket.user.userId,
        receiverId,
        message,
        mediaUrl,
        mediaType,
        status: receiverIsOnlineInRoom ? "delivered" : "sent"
      });

      //ACK TO SENDER
      socket.emit("private_message_self", {
        tempId: clientTempId,
        id: savedMsg.id,
        status: savedMsg.status
      });

      if (receiverIsOnlineInRoom) {
        socket.emit("messages_delivered", {
          messageIds: [savedMsg.id]
        });
      }

      socket.to(roomId).emit("private_message", {
        id: savedMsg.id,
        roomId,
        senderId: socket.user.userId,
        senderName: socket.user.name,
        message: savedMsg.message,
        mediaUrl: savedMsg.mediaUrl,
        mediaType: savedMsg.mediaType,
        createdAt: savedMsg.createdAt
      });
    });

  socket.on("read_private_messages", async ({ roomId, senderId }) => {
    const unread = await PrivateMessage.findAll({
      where: {
        roomId,
        senderId,
        receiverId: socket.user.userId,
        status: "delivered"
      },
      attributes: ["id"]
    });

    if (!unread.length) return;

    await PrivateMessage.update(
      { status: "read" },
      { where: { id: unread.map(m => m.id) } }
    );

    socket.to(roomId).emit("messages_read", {
      messageIds: unread.map(m => m.id)
    });
  });
};