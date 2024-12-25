const mongoose = require("mongoose");

const BreakSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
    },
    duration: {
      type: Number, // in seconds
    },
    exceeded_time: { type: Number, default: 0 }, // Exceeded time in seconds
    remaining_time: { type: Number, default: 60 * 60 },
  },
  { timestamps: true }
);

const BreakModel = mongoose.model("Break", BreakSchema);

module.exports = BreakModel;
