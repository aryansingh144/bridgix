const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');

// GET all discussions
router.get('/', async (req, res) => {
  try {
    const discussions = await Discussion.find()
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar')
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create discussion
router.post('/', async (req, res) => {
  try {
    const discussion = new Discussion(req.body);
    await discussion.save();
    const populated = await discussion.populate('author', 'name avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET single discussion
router.get('/:id', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar')
      .select('-__v');
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    discussion.views += 1;
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add reply
router.post('/:id/reply', async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });
    discussion.replies.push(req.body);
    await discussion.save();
    res.json(discussion);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
