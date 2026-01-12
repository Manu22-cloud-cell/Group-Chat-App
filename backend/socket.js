const jwt = require("jsonwebtoken");

let io;

module.exports = {
    init: (server) => {
        const { Server } = require("socket.io");

        io = new Server(server, {
            cors: { origin: "*" },
        });

        // SOCKET AUTH MIDDLEWARE
        io.use((socket, next) => {
            try {
                const token = socket.handshake.auth.token;

                console.log("Socket token received:", token);

                if (!token) {
                    return next(new Error("Authentication error: Token missing"));
                }

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                console.log("Socket token decoded:", decoded);

                socket.user = decoded;
                next();
            } catch (err) {
                console.error("Socket auth failed:", err.message);
                next(new Error("Authentication error: Invalid token"));
            }
        });

        io.on("connection", (socket) => {
            console.log(
                `User connected: ${socket.user.name} (ID: ${socket.user.userId})`
            );

            socket.on("disconnect", () => {
                console.log(`User disconnected: ${socket.user.name}`);
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
