const { GroupMessage } = require("../../models");

module.exports = (io, socket) => {

  socket.on("join_group", ({ groupId }) => {
    socket.join(`group_${groupId}`);
    console.log(
      `User ${socket.user.userId} joined group_${groupId}`
    );
  });

  socket.on("leave_group", ({ groupId }) => {
    socket.leave(`group_${groupId}`);
  });

  socket.on(
    "send_group_message",
    async ({ groupId, message, mediaUrl, mediaType }) => {
      if (!groupId) return;
      if (!message && !mediaUrl) return;

      const savedMsg = await GroupMessage.create({
        groupId,
        senderId: socket.user.userId,
        message: message || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      });

      const payload = {
        id: savedMsg.id,
        groupId,
        senderId: socket.user.userId,
        senderName: socket.user.name,
        message: savedMsg.message,
        mediaUrl: savedMsg.mediaUrl,
        mediaType: savedMsg.mediaType,
        type: mediaUrl ? "media" : "text",
        createdAt: savedMsg.createdAt,
      };

      socket.to(`group_${groupId}`).emit("group_message", payload);
    }
  );

  socket.on("typing_start_group", ({ groupId }) => {
    socket.to(`group_${groupId}`).emit("typing_group", {
      userName: socket.user.name,
    });
  });

  socket.on("typing_stop_group", ({ groupId }) => {
    socket.to(`group_${groupId}`).emit("stop_typing_group");
  });

};
