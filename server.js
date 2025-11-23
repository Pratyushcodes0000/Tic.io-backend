const express = require("express");
const cors = require("cors");
const DB = require("./db/db.js");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

// Middlewares
app.use(
  cors({
    origin: "*", // You can replace * with your frontend URL later
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route to test API
app.get("/", (req, res) => {
  res.send("BubbleChat Socket.io server is running 🚀");
});

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // your frontend domain recommended
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],  // IMPORTANT for Railway
});

//socket handlers import
const FindMatch = require("./sockets/FindMatch.js");
let onlineCount = 0;

// Socket events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  onlineCount++;
  io.emit("online_players", onlineCount);

  // Matchmaking event handler
  FindMatch(io, socket);

  socket.on("request_online_players", () => {
    io.emit("online_players", onlineCount);
  });

  socket.on("disconnect", () => {
    onlineCount--;
    io.emit("online_players", onlineCount);
    console.log("User disconnected:", socket.id, "Current:", onlineCount);
  });
});

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
