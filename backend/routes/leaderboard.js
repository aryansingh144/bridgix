const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET leaderboard sorted by points
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'alumni'] } })
      .select('name avatar role points college education')
      .sort({ points: -1 })
      .select('-__v');
    const ranked = users.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
    res.json(ranked);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
