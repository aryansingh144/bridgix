const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// GET conversations for user
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET conversation between two users
router.get('/:userId/:otherId', async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    })
      .populate('sender', 'name avatar role')
      .populate('receiver', 'name avatar role')
      .sort({ createdAt: 1 })
      .select('-__v');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send message
router.post('/', async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    const populated = await message.populate('sender receiver', 'name avatar role');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
