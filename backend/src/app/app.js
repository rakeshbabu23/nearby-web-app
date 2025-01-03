require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const http = require("http");
const fs = require("fs");
const https = require("https");

const { errorMiddleware } = require("../middlewares/error.middleware");
const { corsOptionsDelegate } = require("../config/cors.config");
const { io } = require("../routes/sockets/socket.route");

//ROUTES
const authRoutes = require("../routes/auth.route");
const userRoutes = require("../routes/user.route");
const postRoutes = require("../routes/post.route");
const likeRoutes = require("../routes/like.route");
const commentRoutes = require("../routes/comment.route");
const messageRoutes = require("../routes/message.route");

const corsOptions = {
  origin: "https://nearby-web-app.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

const PORT = process.env.PORT || 8000;

const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use("/uploads", express.static("routes/uploads"));
  app.use(cookieParser());

  // CORS
  app.use(cors(corsOptions));

  // Routes
  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/post", postRoutes);
  app.use("/like", likeRoutes);
  app.use("/comment", commentRoutes);
  app.use("/messages", messageRoutes);

  app.use(errorMiddleware);

  let server;

  if (process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
    const key = fs.readFileSync(process.env.SSL_KEY_PATH, "utf8");
    const cert = fs.readFileSync(process.env.SSL_CERT_PATH, "utf8");
    server = https.createServer({ key, cert }, app);
  } else {
    // Fallback to HTTP for development or when SSL is not configured
    server = http.createServer(app);
  }

  // Ensure the server starts listening
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  io.attach(server, {
    cors: {
      origin: "https://nearby-web-app.vercel.app",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  app.io = io;

  return server;
};

module.exports = { createApp };
