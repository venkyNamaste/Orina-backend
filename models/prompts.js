const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema(
  {
    prompt1: String, 
    prompt2: String, 
    prompt3: String, 
    pickupDateTime: Date,
  },
  { timestamps: true }
);

const PromptsModel = mongoose.model("prompt", promptSchema);

module.exports = PromptsModel;
