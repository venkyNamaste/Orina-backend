const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Usermodel = require("../models/User"); 
const Mailjet = require('node-mailjet');
const authMiddleware = require("../middleware/authMiddleware");

const authRouter = express.Router();

/* --------------------------------- SIGNUP --------------------------------- */
authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await Usermodel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new Usermodel({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ Rid: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const mailjet = new Mailjet({
      apiKey: process.env.MAIL_JET_API,
      apiSecret: process.env.MAIL_JET_SECRET_KEY
  });

  const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
          Messages: [
              {
                  From: {
                      Email: process.env.MAIL_USER,
                      Name: "Orina"
                  },
                  To: [
                      { Email: email}
                  ],
                  Subject: "Welcome to Orina - Your Registration is Successful",
                  HTMLPart: `
                  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                      <h2 style="color: #2C3E50;">Welcome to Orina!</h2>
                      <p>Dear User,</p>
                      <p>We are pleased to inform you that your registration with <strong>Orina</strong> was successful. You are now part of a platform designed to simplify your recruitment experience and deliver exceptional value.</p>
                      
                      <h3 style="margin-top: 20px; color: #2C3E50;">What Can You Do with Orina?</h3>
                      <ul style="margin-left: 20px;">
                          <li><strong>Add Candidates Easily:</strong> Directly add candidates or seamlessly import them from your Excel file.</li>
                          <li><strong>Advanced Filters:</strong> Apply seamless and easy filters to manage candidates efficiently.</li>
                          <li><strong>Timely Task Reminders:</strong> Stay on top of your tasks with automated reminders.</li>
                          <li><strong>Break Tracker:</strong> Efficiently manage breaks and improve productivity.</li>
                          <li><strong>Job Description Formatter & Boolean Generator:</strong> Easily create and format job descriptions with powerful tools.</li>
                          <li><strong>And much more...</strong></li>
                      </ul>
                      
                      <p>Start exploring these features now and make your recruitment process smarter and more efficient.</p>

                       <p style="margin-top: 20px; text-align: center;">
            <a href="https://orina.in/auth" style="background-color: #2C3E50; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block; margin-top: 20px;">
                Login to Your Account
            </a>
        </p>
                      
                      <p style="margin-top: 20px;">Best Regards,</p>
                      <p><strong>The Orina Team</strong></p>
                      <hr style="border: none; border-top: 1px solid #ddd; margin-top: 20px;">
                      <p style="font-size: 0.9em; color: #888;">This is an automated message. Please do not reply directly to this email.</p>
                  </div>
              `,
              }
          ]
      });

  request
      .then((result) => {
          console.log("Email sent successfully:", result.body);
      })
      .catch((err) => {
          console.error("Error sending email:", err.statusCode);
      });

    res.status(201).json({ token, user: { id: newUser._id, name, email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* --------------------------------- LOGIN --------------------------------- */
authRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ Rid: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token, msg: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ------------------------------ UPDATE EMAIL ------------------------------ */
authRouter.put("/update-email", authMiddleware, async (req, res) => {
  const { currentEmail, newEmail, confirmEmail } = req.body;

  try {
    if (newEmail !== confirmEmail) {
      return res.status(400).json({ message: "Emails do not match" });
    }

    const user = await Usermodel.findById(req.user.Rid);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.email !== currentEmail) {
      return res.status(400).json({ message: "Current email is incorrect" });
    }

    user.email = newEmail;
    await user.save();

    res.status(200).json({ message: "Email updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update email" });
  }
});

/* ----------------------------- UPDATE PASSWORD ---------------------------- */
authRouter.put("/update-password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  console.log("req.body", currentPassword);

  try {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await Usermodel.findById(req.user.Rid);
    console.log("user ", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update password" });
  }
});

/* -------------------------------- DASHBOARD -------------------------------- */
authRouter.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const user = await Usermodel.findById(req.user.Rid).select("-password");
    res.status(200).json({ message: "Welcome to the Dashboard", user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});


// ---------------------------------forget passowrd -----------------------------
authRouter.post("/forget-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Usermodel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const resetToken = jwt.sign({ Rid: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });

    // TODO: Send email with reset link (e.g., `/reset-password?token=RESET_TOKEN`)
    console.log(`Reset Link: http://localhost:3000/reset-password?token=${resetToken}`);
      const mailjet = new Mailjet({
            apiKey: process.env.MAIL_JET_API,
            apiSecret: process.env.MAIL_JET_SECRET_KEY
        });
    
        const request = mailjet
            .post('send', { version: 'v3.1' })
            .request({
                Messages: [
                    {
                        From: {
                            Email: process.env.MAIL_USER,
                            Name: "Orina"
                        },
                        To: [
                            { Email: email}
                        ],
                        Subject: "Reset Password link", // Customized subject
                        HTMLPart: `
                            <p>Hello there,</p>
                            <p>You requested a password reset.</p>
                            <p>Click <a href="http://localhost:3000/reset-password?token=${resetToken}">here</a> to reset your password.</p>
                            <p>Thank you!</p>
                            <h4>Team Orina</h4>
                        `,
                    }
                ]
            });
    
        request
            .then((result) => {
                console.log("Email sent successfully:", result.body);
            })
            .catch((err) => {
                console.error("Error sending email:", err.statusCode);
            });

    res.status(200).json({ message: "Reset password link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

//  ----------------------------------- reset password ------------------------

authRouter.post("/reset-password", async (req, res) => {
  const { newPassword, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usermodel.findById(decoded.Rid);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Invalid or expired token." });
  }
});


module.exports = authRouter;
