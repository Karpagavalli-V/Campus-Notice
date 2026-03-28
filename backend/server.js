const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env variables
dotenv.config();

// Connect MongoDB
connectDB();

const http = require("http");
const socketUtil = require("./socket");

const app = express();
const path = require("path");

// ... imports

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Create HTTP server
const server = http.createServer(app);

// Init Socket.io
const io = socketUtil.init(server);

// Make io available in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 🔐 Auth routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/notices", require("./routes/noticeRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));


// Test route
app.get("/", (req, res) => {
  res.send("Campus Information Dissemination System API running");
});

// Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
