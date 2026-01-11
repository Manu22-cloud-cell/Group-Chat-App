let io;

module.exports = {
    init: (server) => {
        const { Server } = require("socket.io");
        io = new Server(server, {
            cors: { origin: "*" },
        });

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("disconnect", () => {
                console.log("User disconnected", socket.id);
            });
        });

        return io;
    },

    getIO: () => {
        if (!io) {
            throw new Error("Socket.io not initialized!");
        }
        return io;
    },
};