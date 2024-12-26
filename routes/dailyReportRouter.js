const express = require("express");
const dailyReportRouter = express.Router();
const schedule = require("node-schedule");
const Mailjet = require('node-mailjet');
const Candidate = require("../models/Candidate");
const BreakModel = require("../models/Break"); // ✅ Correct model name
const User = require("../models/User");

// Function to generate the daily candidate report
const sendDailyCandidateReport = async () => {
    try {
        // Fetch all recruiters
        const recruiters = await User.find();

        for (const recruiter of recruiters) {
            const recruiterId = recruiter._id;

            // 🗓️ Define the date range for yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 📝 Query candidates added yesterday
            const candidates = await Candidate.find({
                recruiterId,
                createdAt: { $gte: yesterday, $lt: today }
            });

            const totalCandidates = candidates.length;
            const emailSentCount = candidates.filter(c => c.status.toLowerCase() === 'email sent').length;
            const submittedCount = candidates.filter(c => c.status.toLowerCase() === 'submitted').length;

            // 🕒 Fetch Break Details
            const breaks = await BreakModel.find({
                userId: recruiterId,
                start_time: { $gte: yesterday, $lt: today }
            });

            let totalBreakTime = 0; // In seconds
            let totalExceededTime = 0; // In seconds

            breaks.forEach(breakSession => {
                if (breakSession.duration) {
                    totalBreakTime += breakSession.duration;
                }
                if (breakSession.exceeded_time) {
                    totalExceededTime += breakSession.exceeded_time;
                }
            });

            const formattedBreakTime = `${Math.floor(totalBreakTime / 60)}m ${totalBreakTime % 60}s`;
            const formattedExceededTime = totalExceededTime > 0 
                ? `${Math.floor(totalExceededTime / 60)}m ${totalExceededTime % 60}s` 
                : '0m 0s';

            // 📚 Motivation Message
            let motivationMessage = "Keep up the great work!";
            if (totalCandidates > 10) {
                motivationMessage = "Fantastic effort! You added more than 10 candidates yesterday!";
            } else if (totalCandidates === 0) {
                motivationMessage = "No candidates were added yesterday. Let's make today count!";
            }

            let breakQuote = totalExceededTime > 0 
                ? "Remember, balanced breaks improve productivity. Keep it steady!"
                : "Great time management on your breaks! Keep it up!";

            // 📧 Send email using Mailjet
            const mailjet = new Mailjet({
                apiKey: process.env.MAIL_JET_API,
                apiSecret: process.env.MAIL_JET_SECRET_KEY
            });

            await mailjet.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: process.env.MAIL_USER,
                            Name: "Orina"
                        },
                        To: [
                            { Email: recruiter.email, Name: recruiter.name }
                        ],
                        Subject: "🚀 Your Daily Performance & Break Report",
                        HTMLPart: `
                            <h2 style="color:#00796B;">📊 Daily Candidate & Break Report</h2>
                            <p>Hello <b>${recruiter.name}</b>,</p>
                            <p>Here's your performance summary for yesterday:</p>
                            
                            <h3>🎯 Candidate Summary</h3>
                            <ul>
                                <li><b>Total Candidates Added:</b> ${totalCandidates}</li>
                                <li><b>Email Sent:</b> ${emailSentCount}</li>
                                <li><b>Submitted:</b> ${submittedCount}</li>
                            </ul>

                            <h3>🕒 Break Summary</h3>
                            <ul>
                                <li><b>Total Break Time:</b> ${formattedBreakTime}</li>
                                <li><b>Exceeded Break Time:</b> ${formattedExceededTime}</li>
                            </ul>
                            <p><i>${breakQuote}</i></p>

                            <p style="margin-top:20px;"><b>${motivationMessage}</b></p>
                            <p>Let's make today even better!</p>

                            <p style="margin-top:30px;">Best Regards,<br><b>Team Orina</b></p>
                        `
                    }
                ]
            });

            console.log(`Daily candidate and break report sent to ${recruiter.email}`);
        }
    } catch (error) {
        console.error("Error sending daily candidate report:", error);
    }
};

// 📆 Schedule the daily report job at 8 AM
schedule.scheduleJob("0 7 * * *", async () => {
    console.log("Running scheduled daily candidate report...");
    await sendDailyCandidateReport();
});

// 🛠️ Manual trigger for testing
dailyReportRouter.post("/send-daily-report", async (req, res) => {
    try {
        await sendDailyCandidateReport();
        res.status(200).json({ message: "Daily candidate reports sent successfully." });
    } catch (error) {
        console.error("Error in manual daily report trigger:", error);
        res.status(500).json({ message: "Failed to send daily reports." });
    }
});

module.exports = dailyReportRouter;
