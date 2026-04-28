const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { classify, logDetection, gatherDiscussionContext } = require('../services/spamClient');

// GET all discussions (excludes removed by default)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.includeRemoved === 'true' ? {} : { moderationStatus: { $ne: 'removed' } };
    const discussions = await Discussion.find(filter)
      .populate('author', 'name avatar role')
      .populate('replies.author', 'name avatar')
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create discussion — runs through spam detector
router.post('/', async (req, res) => {
  try {
    const { author, content, title } = req.body;

    const behavioral = await gatherDiscussionContext(author, [title, content].filter(Boolean).join('\n'));
    const { data: prediction } = await classify({
      text: [title, content].filter(Boolean).join('\n'),
      userId: author,
      contentType: 'discussion',
      behavioral
    });

    const discussion = new Discussion({
      ...req.body,
      flagged: prediction.is_spam,
      spamScore: prediction.score,
      moderationStatus: prediction.is_spam ? 'pending' : 'clean'
    });
    await discussion.save();

    await logDetection({
      contentType: 'discussion',
      contentId: discussion._id,
      author,
      text: [title, content].filter(Boolean).join('\n'),
      prediction
    });

    const populated = await discussion.populate('author', 'name avatar role');
    res.status(201).json({
      discussion: populated,
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

// POST add reply — also runs through spam detector
router.post('/:id/reply', async (req, res) => {
  try {
    const { author, content } = req.body;
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ error: 'Discussion not found' });

    const behavioral = await gatherDiscussionContext(author, content);
    const { data: prediction } = await classify({
      text: content,
      userId: author,
      contentType: 'discussion',
      behavioral
    });

    discussion.replies.push({
      author,
      content,
      createdAt: new Date()
    });
    await discussion.save();

    // Reply moderation log uses the parent discussion id; the reply itself is
    // an embedded subdoc and doesn't have its own collection.
    await logDetection({
      contentType: 'discussion',
      contentId: discussion._id,
      author,
      text: content,
      prediction
    });

    const populated = await discussion.populate('replies.author', 'name avatar role');
    res.json({
      discussion: populated,
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
