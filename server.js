const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRouter = require("./routes/auth");
const cors = require("cors");
const candidateRouter = require("./routes/candidates");
const {taskRouter, schedulePendingTasks} = require("./routes/tasks");
const breakRouter = require("./routes/breakRoutes");
const notesRouter = require("./routes/notes");
const deepRouter = require("./routes/deep");
const fileUpload = require('express-fileupload');
const dailyReportRouter = require("./routes/dailyReportRouter");
const promptRouter = require("./routes/prompts");
const PayRouter = require("./routes/payment");


// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(cors());




// Test Route
app.get("/", (req, res) => {
  res.send("Hello world...");
});

// Middleware
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/candidate", candidateRouter)
app.use("/tasks", taskRouter)
app.use("/breaks", breakRouter);
app.use("/note", notesRouter);
app.use("/api", deepRouter)
app.use("/daily-report", dailyReportRouter);
app.use("/prompts", promptRouter);
app.use("/api/payment", PayRouter)

const PORT = process.env.PORT || 5000;
schedulePendingTasks()
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
