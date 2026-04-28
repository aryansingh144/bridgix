const express = require('express');
const router = express.Router();
const Detection = require('../models/Detection');
const Post = require('../models/Post');
const Message = require('../models/Message');
const { classify } = require('../services/spamClient');

const contentModel = (type) => (type === 'post' ? Post : type === 'message' ? Message : null);

// GET moderation queue (default: pending)
router.get('/', async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const filter = status === 'all' ? {} : { status };
    const items = await Detection.find(filter)
      .populate('author', 'name avatar role')
      .populate('reviewedBy', 'name avatar role')
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit || '100', 10))
      .select('-__v');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats — used by admin dashboard widgets
router.get('/stats', async (req, res) => {
  try {
    const [pending, approved, removed, total] = await Promise.all([
      Detection.countDocuments({ status: 'pending' }),
      Detection.countDocuments({ status: 'approved' }),
      Detection.countDocuments({ status: 'removed' }),
      Detection.countDocuments({})
    ]);
    res.json({ pending, approved, removed, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST classify a piece of text directly (for testing / admin tools)
router.post('/classify', async (req, res) => {
  try {
    const { text, behavioral, graph } = req.body;
    const { data } = await classify({ text, contentType: 'message', behavioral, graph });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT review a detection — approve (keep content) or remove
router.put('/:id', async (req, res) => {
  try {
    const { decision, reviewerId } = req.body; // 'approve' | 'remove'
    if (!['approve', 'remove'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be approve or remove' });
    }

    const detection = await Detection.findById(req.params.id);
    if (!detection) return res.status(404).json({ error: 'Detection not found' });

    detection.status = decision === 'approve' ? 'approved' : 'removed';
    detection.reviewedBy = reviewerId || null;
    detection.reviewedAt = new Date();
    await detection.save();

    const Model = contentModel(detection.contentType);
    if (Model) {
      const newStatus = decision === 'approve' ? 'approved' : 'removed';
      const update = { moderationStatus: newStatus };
      if (decision === 'approve') update.flagged = false;
      await Model.findByIdAndUpdate(detection.contentId, update);
    }

    res.json(detection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
