const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Connection = require('../models/Connection');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Discussion = require('../models/Discussion');

// GET aggregate platform counters used by the college dashboard.
router.get('/', async (req, res) => {
  try {
    const [students, alumni, connections, posts, events, discussions] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'alumni' }),
      Connection.countDocuments({ status: 'accepted' }),
      Post.countDocuments({ moderationStatus: { $ne: 'removed' } }),
      Event.countDocuments({}),
      Discussion.countDocuments({ moderationStatus: { $ne: 'removed' } })
    ]);
    res.json({ students, alumni, connections, posts, events, discussions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
