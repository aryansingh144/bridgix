const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Connection = require('../models/Connection');

const isValidId = (id) => mongoose.isValidObjectId(id);

// GET connections for a user
router.get('/:userId', async (req, res) => {
  try {
    if (!isValidId(req.params.userId)) {
      return res.json([]); // not a real user — return empty rather than 500
    }
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
    const { requester, recipient } = req.body || {};
    if (!isValidId(requester) || !isValidId(recipient)) {
      return res.status(400).json({ error: 'requester and recipient must be valid user ids — sign in first' });
    }
    if (String(requester) === String(recipient)) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }
    const existing = await Connection.findOne({
      $or: [
        { requester, recipient },
        { requester: recipient, recipient: requester }
      ]
    });
    if (existing) return res.status(400).json({ error: 'Connection already exists', existing });
    const connection = new Connection({ requester, recipient });
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
