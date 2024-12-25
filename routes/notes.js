const express = require("express");
const notesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const NotesModel = require("../models/Notes");

// Get all notes for the logged-in user
notesRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const notes = await NotesModel.find({ userId: req.user.Rid }).sort({
      createdAt: -1,
    });
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notes" });
  }
});

// Create or update a note
notesRouter.post("/save", authMiddleware, async (req, res) => {
  const { position, text } = req.body;

  if (!position || !text) {
    return res.status(400).json({ error: "Position and text are required" });
  }

  try {
    const userId = req.user.Rid;

    // Check if a note already exists at the given position for this user
    const existingNote = await NotesModel.findOne({
      userId,
      "position.x": position.x,
      "position.y": position.y,
    });

    if (existingNote) {
      // Update the existing note
      existingNote.text = text;
      await existingNote.save();
      return res.status(200).json(existingNote);
    }

    // Create a new note
    const newNote = new NotesModel({
      userId,
      position,
      text,
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ error: "Error saving note" });
  }
});

module.exports = notesRouter;
