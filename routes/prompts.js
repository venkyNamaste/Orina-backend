const express = require('express');
const PromptsModel = require('../models/prompts');


const promptRouter = express.Router();

/**
 * 📝 GET /prompts
 * Fetches the latest prompt document.
 */
promptRouter.get('/', async (req, res) => {
  try {
    const prompt = await PromptsModel.findOne().sort({ createdAt: -1 }); // Fetch the latest prompt
    if (prompt) {
      return res.status(200).json({ success: true, data: prompt });
    } else {
      return res.status(404).json({ success: false, message: "No prompts found." });
    }
  } catch (error) {
    console.error("Error fetching prompt:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

/**
 * 🛠️ PUT /prompts
 * Updates the latest prompt if it exists, otherwise creates a new one.
 */
promptRouter.put('/', async (req, res) => {
  const { prompt1, prompt2, prompt3, pickupDateTime } = req.body;

  try {
    let prompt = await PromptsModel.findOne().sort({ createdAt: -1 }); // Get the latest prompt

    if (prompt) {
      // Update existing prompt
      prompt.prompt1 = prompt1 || prompt.prompt1;
      prompt.prompt2 = prompt2 || prompt.prompt2;
      prompt.prompt3 = prompt3 || prompt.prompt3;
      prompt.pickupDateTime = pickupDateTime || prompt.pickupDateTime;

      await prompt.save();
      return res.status(200).json({ success: true, message: "Prompt updated successfully", data: prompt });
    } else {
      // Create a new prompt if none exists
      const newPrompt = new PromptsModel({
        prompt1,
        prompt2,
        prompt3,
        pickupDateTime,
      });

      await newPrompt.save();
      return res.status(201).json({ success: true, message: "Prompt created successfully", data: newPrompt });
    }
  } catch (error) {
    console.error("Error updating/creating prompt:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

module.exports = promptRouter;
