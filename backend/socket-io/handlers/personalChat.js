module.exports = (io, socket) => {
  /**
   * JOIN A PERSONAL ROOM
   */
  socket.on("join_room", ({ roomId }) => {
    if (!roomId) return;

    socket.join(roomId);

    console.log(
      `User ${socket.user.userId} joined room ${roomId}`
    );
  });

  /**
   * LEAVE A PERSONAL ROOM
   */
  socket.on("leave_room", ({ roomId }) => {
    if (!roomId) return;

    socket.leave(roomId);

    console.log(
      `User ${socket.user.userId} left room ${roomId}`
    );
  });

  /**
   * SEND PERSONAL MESSAGE
   */
  socket.on("new_message", ({ roomId, message }) => {
    if (!roomId || !message) return;

    const payload = {
      message,
      roomId,
      sender: {
        id: socket.user.userId,
        name: socket.user.name,
      },
      createdAt: new Date(),
    };

    // emit ONLY to that room
    io.to(roomId).emit("new_message", payload);
  });
};
