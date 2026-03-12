const express = require('express');
const router = express.Router();
const Connection = require('../models/Connection');

// GET connections for a user
router.get('/:userId', async (req, res) => {
  try {
    const connections = await Connection.find({
      $or: [{ requester: req.params.userId }, { recipient: req.params.userId }]
    })
      .populate('requester', 'name avatar role occupation education')
      .populate('recipient', 'name avatar role occupation education')
      .select('-__v');
    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST send connection request
router.post('/', async (req, res) => {
  try {
    const existing = await Connection.findOne({
      $or: [
        { requester: req.body.requester, recipient: req.body.recipient },
        { requester: req.body.recipient, recipient: req.body.requester }
      ]
    });
    if (existing) return res.status(400).json({ error: 'Connection already exists' });
    const connection = new Connection(req.body);
    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update connection status
router.put('/:id', async (req, res) => {
  try {
    const connection = await Connection.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!connection) return res.status(404).json({ error: 'Connection not found' });
    res.json(connection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
