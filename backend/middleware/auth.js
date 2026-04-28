const User = require('../models/User');
const { verifyToken } = require('../services/auth');

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Missing Authorization Bearer token' });
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.user = user;
    req.userId = user._id;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Attaches req.user when a token is present, but never blocks the request.
async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (user) {
      req.user = user;
      req.userId = user._id;
    }
  } catch (_) { /* ignore */ }
  next();
}

module.exports = { requireAuth, optionalAuth };
