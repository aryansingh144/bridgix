const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const { classify, logDetection, gatherPostContext } = require('../services/spamClient');

// GET all posts (only non-removed for default feed)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.includeRemoved === 'true' ? {} : { moderationStatus: { $ne: 'removed' } };
    const posts = await Post.find(filter)
      .populate('author', 'name avatar role occupation education')
      .populate('comments.author', 'name avatar')
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create post — runs through spam detector before persist
router.post('/', async (req, res) => {
  try {
    const { author, content } = req.body;

    const behavioral = await gatherPostContext(author, content);
    const { data: prediction } = await classify({
      text: content,
      userId: author,
      contentType: 'post',
      behavioral
    });

    const post = new Post({
      ...req.body,
      flagged: prediction.is_spam,
      spamScore: prediction.score,
      moderationStatus: prediction.is_spam ? 'pending' : 'clean'
    });
    await post.save();

    await logDetection({
      contentType: 'post',
      contentId: post._id,
      author,
      text: content,
      prediction
    });

    const populated = await post.populate('author', 'name avatar role');
    res.status(201).json({
      post: populated,
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

// PUT toggle like
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const userId = req.body.userId;
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST add comment
router.post('/:id/comment', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push(req.body);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
