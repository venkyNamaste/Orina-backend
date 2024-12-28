const mongoose = require("mongoose");

const CandidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    contact: {
      type: String,
    },
    position: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      default: "Interested",
    },
    recruiterId: {
        type: String,
        required: true,
      },
      jobid: {
        type: String,
        required: true,
      },
      pickupDateTime: {
        type: Date, // Store as a JavaScript Date object
        default: null, // Default to null if not provided
      },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Candidate = mongoose.model("Candidate", CandidateSchema);

module.exports = Candidate;
