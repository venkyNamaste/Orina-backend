const express = require("express");
const notesRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const NotesModel = require("../models/Notes");

// Fetch the note for the logged-in user
notesRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const note = await NotesModel.findOne({ userId: req.user.Rid });

    if (note) {
      res.status(200).json({ text: note.text });
    } else {
      res.status(200).json({ text: "" });
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching note" });
  }
});

// Save or update the note for the logged-in user
notesRouter.post("/save", authMiddleware, async (req, res) => {
  const { text } = req.body;

  if (typeof text !== "string") {
    return res.status(400).json({ error: "Text is required and must be a string" });
  }

  try {
    const userId = req.user.Rid;

    let note = await NotesModel.findOne({ userId });

    if (note) {
      // Update the existing note
      note.text = text;
      await note.save();
    } else {
      // Create a new note
      note = new NotesModel({
        userId,
        text,
      });
      await note.save();
    }

    res.status(200).json({ message: "Note saved successfully", note });
  } catch (error) {
    console.error("Error saving note:", error);
    res.status(500).json({ error: "Error saving note" });
  }
});

module.exports = notesRouter;
