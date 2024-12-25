const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    position: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
    },
    text: { type: String, required: true },
  },
  { timestamps: true } 
);

const NotesModel = mongoose.model("Note", NoteSchema);

module.exports = NotesModel
