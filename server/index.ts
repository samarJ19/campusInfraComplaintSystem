import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./config/db";

// // Routes
// import authRoutes from "./routes/auth.routes";
// import complaintRoutes from "./routes/complaint.routes";
// import notificationRoutes from "./routes/notification.routes";
// import commentRoutes from "./routes/comment.routes";
// import dashboardRoutes from "./routes/dashboard.routes";

// Socket
// import { initializeSocket } from "./socket";

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
  })
);

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Campus Infrastructure Management API Running",
  });
});

// // API Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/complaints", complaintRoutes);
// app.use("/api/notifications", notificationRoutes);
// app.use("/api/comments", commentRoutes);
// app.use("/api/dashboard", dashboardRoutes);

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // initializeSocket(server);
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();