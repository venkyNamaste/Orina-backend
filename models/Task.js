const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: "Candidate" },
    name: String,
    email: String,
    contact: String,
    position: String,
    location: String,
    jobid: String,
    status: String,
    userId: String,
    status: { type: String, default: "Pending" },
    remindersSent: { type: Array, default: [] }, 
    pickupDateTime: Date,
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = Task;
