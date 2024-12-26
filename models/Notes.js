const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    userId: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true 
    },
    text: { 
      type: String, 
      default: "" 
    },
  },
  { 
    timestamps: true 
  }
);

const NotesModel = mongoose.model("Note", NoteSchema);

module.exports = NotesModel;
