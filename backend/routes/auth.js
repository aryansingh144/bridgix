const express = require('express');
const router = express.Router();
const User = require('../models/User');
const {
  hashPassword,
  verifyPassword,
  signToken,
  sanitizeUser
} = require('../services/auth');
const { requireAuth } = require('../middleware/auth');

const ROLES = ['student', 'alumni', 'college'];

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'student', college, education, occupation } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${ROLES.join(', ')}` });
    }

    const normalisedEmail = String(email).toLowerCase().trim();
    const existing = await User.findOne({ email: normalisedEmail });
    if (existing) return res.status(409).json({ error: 'An account with that email already exists' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email: normalisedEmail,
      passwordHash,
      role,
      college,
      education,
      occupation,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2BC0B4&color=fff&size=128`
    });

    const token = signToken(user);
    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await User.findOne({ email: String(email).toLowerCase().trim() }).select('+passwordHash');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(user);
    res.json({ token, user: sanitizeUser(user) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json(sanitizeUser(req.user));
});

module.exports = router;
