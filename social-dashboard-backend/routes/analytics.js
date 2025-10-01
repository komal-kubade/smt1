const express = require("express");
const router = express.Router();
const Analytics = require("../models/Analytics");

// @route   POST /api/analytics
// @desc    Generate and save analytics data (demo version with random values)
// @access  Public (you can later secure with JWT if needed)
router.post("/", async (req, res) => {
  try {
    const { keyword, platform } = req.body;

    if (!keyword || !platform) {
      return res
        .status(400)
        .json({ error: "Keyword and platform are required" });
    }

    // Generate dummy analytics
    const analyticsData = {
      keyword,
      platform,
      mentions: Math.floor(Math.random() * 500 + 50),
      likes: Math.floor(Math.random() * 1000 + 100),
      shares: Math.floor(Math.random() * 300 + 20), // Always include "shares"
    };

    // Save to DB
    const newAnalytics = new Analytics(analyticsData);
    await newAnalytics.save();

    // Return clean JSON (no DB metadata)
    res.json({
      keyword: newAnalytics.keyword,
      platform: newAnalytics.platform,
      mentions: newAnalytics.mentions,
      likes: newAnalytics.likes,
      shares: newAnalytics.shares,
    });
  } catch (err) {
    console.error("❌ Analytics error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// @route   GET /api/analytics
// @desc    Fetch all analytics (for testing / dashboard history)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const allAnalytics = await Analytics.find().sort({ createdAt: -1 });
    res.json(allAnalytics);
  } catch (err) {
    console.error("❌ Fetch analytics error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
