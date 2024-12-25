const express = require("express");
const candidateRouter = express.Router();
const Candidate = require("../models/Candidate"); // Assuming a Candidate model
const authMiddleware = require("../middleware/authMiddleware");
const XLSX = require("xlsx");

// Get Candidates with Pagination and Search
// GET /api/candidates
candidateRouter.get("/", authMiddleware, async (req, res) => {
    try {
      const recruiterId = req.user.Rid; // Extract recruiter ID from auth middleware

  
      // Parse and validate query parameters
      let { page = 1, limit = 10, position = "", status = "" } = req.query;
      page = Math.max(Number(page), 1); // Ensure page is at least 1
      limit = Math.max(Number(limit), 1); // Ensure limit is at least 1
  
      // Build query object dynamically
      const query = {
        recruiterId, // Filter by recruiter ID
        ...(position && { position: { $regex: position, $options: "i" } }), // Case-insensitive regex for position
        ...(status && { status: { $regex: status, $options: "i" } }), // Case-insensitive regex for status
      };
  
      // Fetch candidates with pagination
      const candidates = await Candidate.find(query)
        .skip((page - 1) * limit) // Skip documents for pagination
        .limit(limit); // Limit number of documents
  
      // Get total count for pagination
      const total = await Candidate.countDocuments(query);
  
      // Return data to the client
      res.status(200).json({
        candidates,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Error fetching candidates", error: error.message });
    }
  });

candidateRouter.post('/upload',authMiddleware, async (req, res) => {
    try {

      console.log("Req.files:", req.files);
      // 📝 Validate File Upload
      if (!req.files || !req.files.file) {
        return res.status(400).json({ success: false, message: "No file uploaded." });
      }
  
      // 📚 Parse Excel File
      const workbook = XLSX.read(req.files.file.data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0]; 
      const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  
      if (jsonData.length === 0) {
        return res.status(400).json({ success: false, message: "Excel sheet is empty." });
      }
  
      let savedCount = 0;
      let duplicateCount = 0;
      let errorCount = 0;
  
      // 🔄 Process each row individually
      for (const item of jsonData) {
        try {
          // 🛡️ Validate required fields
          if (!item.Email || !item.Name) {
            console.warn(`Skipping invalid row: ${JSON.stringify(item)}`);
            errorCount++;
            continue;
          }
  
          // ⚠️ Check for Duplicate Email
          const existing = await Candidate.findOne({ email: item.Email });
          if (existing) {
            console.warn(`Duplicate entry found: ${item.Email}`);
            duplicateCount++;
            continue;
          }
  
          // ✅ Save Unique Candidate
          const candidate = new Candidate({
            name: item.Name,
            email: item.Email,
            contact: item.Contact || "",
            position: item.Position || "",
            location: item.Location || "",
            status: item.Status || "New",
            jobid: item.JobID || "N/A",
            recruiterId: req.user.Rid,
          });
          await candidate.save();
          savedCount++;
        } catch (rowError) {
          console.error(`Error saving row: ${JSON.stringify(item)}`, rowError.message);
          errorCount++;
        }
      }
  
      // 📊 Summary Response
      const message = `${savedCount} candidates saved successfully. ${duplicateCount} duplicates skipped. ${errorCount} rows had errors.`;
  
      return res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      console.error("❌ Error processing file:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to process file.",
      });
    }
  });

// Route: Add a new candidate
// POST /api/candidates/save
candidateRouter.post("/save", authMiddleware, async (req, res) => {
    const recruiterId = req.user.Rid;
    const { name, email, contact, position, location, status, notes, jobid , pickupDateTime} = req.body;
  
    try {
      const newCandidate = new Candidate({
        name,
        email,
        contact,
        position,
        location,
        status,
        notes,
        recruiterId,
        jobid,
        pickupDateTime
      });
  
      await newCandidate.save();
  
      res.status(201).json({ message: "Candidate added successfully" });
    } catch (error) {
      console.error("Error adding candidate:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

// Route: Update a candidate
// PUT /api/candidates/:id
candidateRouter.put("/:id", authMiddleware, async (req, res) => {
    const recruiterId = req.user.Rid;
    const { id } = req.params;
  
    try {
      // Find the candidate and ensure it belongs to the recruiter
      const candidate = await Candidate.findOne({ _id: id, recruiterId });
  
      if (!candidate) {
        return res.status(404).json({ message: "Candidate not found or unauthorized" });
      }
  
      // Update candidate details
      const updatedCandidate = await Candidate.findByIdAndUpdate(id, req.body, { new: true });
  
      res.status(200).json({ message: "Candidate updated successfully", candidate: updatedCandidate });
    } catch (error) {
      console.error("Error updating candidate:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

  // GET /api/candidates/stats/total
  candidateRouter.get("/stats/total", authMiddleware, async (req, res) => {
    const recruiterId = req.user.Rid;
    const { date } = req.query;
  
    try {
      // Query to filter by recruiter and date (optional)
      const query = { recruiterId };
      if (date) {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(startOfDay.getDate() + 1);
        query.createdAt = { $gte: startOfDay, $lt: endOfDay };
      }
  
      const total = await Candidate.countDocuments(query);
      res.status(200).json({ count: total });
    } catch (error) {
      console.error("Error fetching total candidates:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

// GET /api/candidates/stats/status/:status
candidateRouter.get("/stats/status/:status", authMiddleware, async (req, res) => {
  const recruiterId = req.user.Rid;
  const { status } = req.params;
  const { date } = req.query;

  try {
    // Query to filter by recruiter, status, and date (optional)
    const query = { recruiterId, status: { $regex: status, $options: "i" } };
    if (date) {
      const startOfDay = new Date(date);
      const endOfDay = new Date(date);
      endOfDay.setDate(startOfDay.getDate() + 1);
      query.createdAt = { $gte: startOfDay, $lt: endOfDay };
    }

    const count = await Candidate.countDocuments(query);
    res.status(200).json({ count });
  } catch (error) {
    console.error(`Error fetching candidates with status ${status}:`, error);
    res.status(500).json({ message: "Server error" });
  }
});



module.exports = candidateRouter;
