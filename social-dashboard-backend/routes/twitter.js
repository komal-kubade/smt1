const express = require("express");
const router = express.Router();
const twitterClient = require("../twitter"); // your client from step 3

router.get("/trends/:keyword", async (req, res) => {
  try {
    const { keyword } = req.params;

    // Search recent tweets
    const tweets = await twitterClient.v2.search(keyword, { max_results: 100 });

    let mentions = 0,
      likes = 0,
      retweets = 0;
    for (const tweet of tweets.data || []) {
      mentions++;
      likes += tweet.public_metrics?.like_count || 0;
      retweets += tweet.public_metrics?.retweet_count || 0;
    }

    res.json({ mentions, likes, shares: retweets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Twitter data" });
  }
});

module.exports = router;
