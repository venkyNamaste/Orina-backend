const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");
const cors = require("cors");
const candidateRouter = require("./routes/candidates");
const { taskRouter, schedulePendingTasks } = require("./routes/tasks");
const breakRouter = require("./routes/breakRoutes");
const notesRouter = require("./routes/notes");
const deepRouter = require("./routes/deep");
const fileUpload = require("express-fileupload");

// ✅ 1. Load environment variables
dotenv.config();

// ✅ 2. Connect to MongoDB
connectDB();

// ✅ 3. Initialize Express App
const app = express();

// ✅ 4. Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());

// ✅ 5. Test Route
app.get("/", (req, res) => {
  res.send("Hello world...");
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    message: "Server is healthy",
    timestamp: Date.now(),
  });
});


// ✅ 6. API Routes
app.use("/api/auth", authRouter);
app.use("/candidate", candidateRouter);
app.use("/tasks", taskRouter);
app.use("/breaks", breakRouter);
app.use("/note", notesRouter);
app.use("/api", deepRouter);

// ✅ 7. Schedule Pending Tasks
schedulePendingTasks();

// ✅ 8. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
