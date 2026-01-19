require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const http = require("http");

const app = express();

/* ---------- IMPORT MODELS (IMPORTANT) ---------- */
const { sequelize } = require("./models");

/* ---------- ROUTES ---------- */
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const mediaRoutes=require("./routes/mediaRoutes");

const socket = require("./socket-io");

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------- STATIC FILES ---------- */
app.use(express.static(path.join(__dirname, "..", "public")));

/* ---------- ROUTES ---------- */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

app.use("/auth", authRoutes);
app.use("/messages", messageRoutes);
app.use("/users", userRoutes);
app.use("/groups", groupRoutes);
app.use("/media",mediaRoutes);

/* ---------- SERVER ---------- */
const server = http.createServer(app);
socket.init(server);

/* ---------- DB SYNC + START ---------- */
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");

    // Drop & recreate tables
    await sequelize.sync();

    console.log("Database synced");

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("DB sync failed:", error);
  }
})();
