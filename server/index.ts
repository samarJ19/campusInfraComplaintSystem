import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db";

// // Routes
import authRoutes from "./routes/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import complaintRoutes from "./routes/complaint.routes";
import reassignmentRoutes from "./routes/reassignment.routes";
// import notificationRoutes from "./routes/notification.routes";
// import commentRoutes from "./routes/comment.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import http from "http";
import { initializeSocket } from "./socket/socket";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Campus Infrastructure Management API Running",
  });
});

// // API Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/reassignments", reassignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/comments", commentRoutes);
app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDB();


    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(PORT, () => {
      console.log("Server running");
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
