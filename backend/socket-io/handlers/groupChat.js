module.exports = (io, socket) => {
  socket.on("join_group", ({ groupId }) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("group_message", ({ groupId, message }) => {
    const payload = {
      message,
      sender: socket.user,
      groupId,
      createdAt: new Date(),
    };

    io.to(`group_${groupId}`).emit("group_message", payload);
  });
};
