const { PrivateMessage } = require("../../models");

module.exports = (io, socket) => {

  socket.on("join_private", ({ roomId }) => {
    socket.join(roomId);
    console.log(`User ${socket.user.userId} joined ${roomId}`);
  });

  socket.on("leave_private", ({ roomId }) => {
    socket.leave(roomId);
  });

  socket.on(
    "send_private_message",
    async ({ roomId, receiverId, message, mediaUrl, mediaType }) => {

      if (!roomId || !receiverId) return;
      if (!message && !mediaUrl) return;

      const savedMsg = await PrivateMessage.create({
        roomId,
        senderId: socket.user.userId,
        receiverId,
        message: message || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null
      });

      const payload = {
        id: savedMsg.id,
        roomId,
        senderId: socket.user.userId,
        senderName: socket.user.name,
        message: savedMsg.message,
        mediaUrl: savedMsg.mediaUrl,
        mediaType: savedMsg.mediaType,
        type: mediaUrl ? "media" : "text",
        createdAt: savedMsg.createdAt
      };

      socket.to(roomId).emit("private_message", payload);
    }
  );
};
