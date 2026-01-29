const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");
const personalChatHandler = require("./handlers/personalChat");
const groupChatHandler = require("./handlers/groupChat");

const onlineUsers = new Map(); // userId -> socket.id

let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    const userId = socket.user.userId;
    onlineUsers.set(userId, socket.id);

    io.emit("online_users", Array.from(onlineUsers.keys()));

    console.log(
      `User connected: ${socket.user.name} (ID: ${socket.user.userId})`
    );

    personalChatHandler(io, socket);
    groupChatHandler(io, socket);

    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("online-users", Array.from(onlineUsers.keys()));
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = { init, getIO };
