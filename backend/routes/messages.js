const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { classify, logDetection, gatherMessageContext } = require('../services/spamClient');

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

// POST send message — runs through spam detector before persist
router.post('/', async (req, res) => {
  try {
    const { sender, content } = req.body;

    const behavioral = await gatherMessageContext(sender, content);
    const { data: prediction } = await classify({
      text: content,
      userId: sender,
      contentType: 'message',
      behavioral
    });

    const message = new Message({
      ...req.body,
      flagged: prediction.is_spam,
      spamScore: prediction.score,
      moderationStatus: prediction.is_spam ? 'pending' : 'clean'
    });
    await message.save();

    await logDetection({
      contentType: 'message',
      contentId: message._id,
      author: sender,
      text: content,
      prediction
    });

    const populated = await message.populate('sender receiver', 'name avatar role');
    res.status(201).json({
      message: populated,
      moderation: {
        flagged: prediction.is_spam,
        score: prediction.score,
        label: prediction.label,
        reasons: prediction.reasons
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
