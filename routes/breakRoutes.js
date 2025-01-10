const express = require("express");
const breakRouter = express.Router();
const { verifyToken } = require("../middleware/authMiddleware"); // Ensure only logged-in users can access
const authMiddleware = require("../middleware/authMiddleware");
const BreakModel = require("../models/Break");

// Get all breaks for the logged-in user
breakRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const breaks = await BreakModel.find({ userId: req.user.Rid }).sort({
      createdAt: -1,
    });
    res.status(200).json(breaks);
  } catch (error) {
    res.status(500).json({ error: "Error fetching breaks" });
  }
});

// Create a new break
// Create or Resume a Break
breakRouter.post("/", authMiddleware, async (req, res) => {
  const { start_time } = req.body;

  try {
    const userId = req.user.Rid;

    // Check for the latest ongoing or completed break
    const latestBreak = await BreakModel.findOne({ userId }).sort({ createdAt: -1 });

    let remainingTime = 60 * 60; // Default 1 hour
    if (latestBreak && latestBreak.remaining_time) {
      remainingTime = latestBreak.remaining_time; // Resume from last remaining time
    }

    // Check if there's an ongoing break
    const ongoingBreak = await BreakModel.findOne({ userId, end_time: null });
    if (ongoingBreak) {
      return res.status(200).json({
        message: "Resuming ongoing break",
        remaining_time: ongoingBreak.remaining_time,
      });
    }

    // Create a new break with the remaining time
    const newBreak = new BreakModel({
      userId,
      start_time,
      remaining_time: remainingTime,
    });

    await newBreak.save();
    res.status(201).json(newBreak);
  } catch (error) {
    console.error("Error starting break:", error);
    res.status(500).json({ error: "Error starting break" });
  }
});



// Fetch breaks filtered by date
breakRouter.get("/filter", authMiddleware, async (req, res) => {
  const { date } = req.query; // Pass date as query param (format: YYYY-MM-DD)
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const breaks = await BreakModel.find({
      userId: req.user.Rid,
      start_time: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ start_time: 1 });

    res.status(200).json(breaks);
  } catch (error) {
    res.status(500).json({ error: "Error filtering breaks" });
  }
});


// Update a break (end time and duration)
// Stop Break and Update Duration
// Stop Break and Update Duration
// Stop Break and Update Duration
breakRouter.patch("/", authMiddleware, async (req, res) => {
  const { end_time } = req.body;

  try {
    const userId = req.user.Rid;

    // Find the ongoing break (end_time is null)
    const ongoingBreak = await BreakModel.findOne({ userId, end_time: null });

    if (!ongoingBreak) {
      return res.status(404).json({ error: "No ongoing break found." });
    }

    const endTime = new Date(end_time);
    const startTime = new Date(ongoingBreak.start_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return res.status(400).json({ error: "Invalid start or end time." });
    }

    // Calculate session duration
    const sessionDuration = (endTime - startTime) / 1000; // Duration in seconds
    if (sessionDuration < 0) {
      return res.status(400).json({ error: "End time cannot be before start time." });
    }

    // Adjust remaining time and exceeded time
    const updatedRemainingTime = Math.max(ongoingBreak.remaining_time - sessionDuration, 0);
    const exceededTime = sessionDuration > ongoingBreak.remaining_time
      ? sessionDuration - ongoingBreak.remaining_time
      : 0;

    // Update the ongoing break
    ongoingBreak.end_time = endTime;
    ongoingBreak.duration = (ongoingBreak.duration || 0) + sessionDuration;
    ongoingBreak.remaining_time = updatedRemainingTime;
    ongoingBreak.exceeded_time = (ongoingBreak.exceeded_time || 0) + exceededTime;

    await ongoingBreak.save();

    res.status(200).json({
      message: "Break stopped successfully",
      remaining_time: updatedRemainingTime,
      exceeded_time: exceededTime,
    });
  } catch (error) {
    console.error("Error stopping break:", error);
    res.status(500).json({ error: "Error stopping break" });
  }
});


module.exports = breakRouter;
