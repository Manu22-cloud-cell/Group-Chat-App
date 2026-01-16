const { Server } = require("socket.io");
const socketMiddleware = require("./middleware");
const chatHandler = require("./handlers/chat");
const personalChatHandler=require("./handlers/personalChat");
const groupChatHandler = require("./handlers/groupChat");

let io;

function init(server) {
    io = new Server(server, {
        cors: { origin: "*" },
    });

    // attach auth middleware
    io.use(socketMiddleware);

    io.on("connection", (socket) => {
        console.log(
            `User connected: ${socket.user.name} (ID: ${socket.user.userId})`
        );

        // register chat handlers
        chatHandler(io, socket);

        // register personal chat handler
        personalChatHandler(io,socket);

        //register group chat handler
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
