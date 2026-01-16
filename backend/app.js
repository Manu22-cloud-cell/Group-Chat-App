require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");

// import sequelize
const { sequelize } = require("./models");

//routes
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes=require("./routes/userRoutes");
const groupRoutes=require("./routes/groupRoutes");

const socket = require("./socket-io");

const app = express();

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Serve static files
app.use(express.static(path.join(__dirname, "..", "public")));

//Defalut route
app.get("/", (req,res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"))
});

//ROUTES
app.use("/auth", authRoutes);
app.use("/message", messageRoutes);
app.use("/users",userRoutes);
app.use("/groups",groupRoutes);

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

