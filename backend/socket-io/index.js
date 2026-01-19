const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");
const personalChatHandler = require("./handlers/personalChat");
const groupChatHandler = require("./handlers/groupChat");

let io;

function init(server) {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    console.log(
      `User connected: ${socket.user.name} (ID: ${socket.user.userId})`
    );

    personalChatHandler(io, socket);
    groupChatHandler(io, socket);

    socket.on("disconnect", () => {
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
