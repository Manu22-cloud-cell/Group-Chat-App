require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

// import sequelize
const { sequelize } = require("./models");

//routes
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

const socket=require("./socket");

const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//ROUTES
app.use("/auth", authRoutes);
app.use("/message", messageRoutes);

//create HTTP server
const server = http.createServer(app);

// initialize socket.io
socket.init(server);

//DB SYNC & SERVER START
sequelize
    .sync()
    .then(() => {
        console.log("Database synced");
        const PORT = process.env.PORT || 3000;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error("DB sync failed:", err));

