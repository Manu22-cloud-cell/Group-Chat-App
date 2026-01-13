module.exports = (io, socket) => {
    // future: join rooms here
    // socket.join("global");

    socket.on("typing", () => {
        socket.broadcast.emit("typing", {
            user: socket.user.name,
        });
    });

    // you can add more chat events later
};
