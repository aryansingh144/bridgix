const axios = require('axios');
const Detection = require('../models/Detection');
const Post = require('../models/Post');
const Message = require('../models/Message');

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = parseInt(process.env.ML_TIMEOUT_MS || '4000', 10);

const FAIL_OPEN = (process.env.ML_FAIL_OPEN || 'true').toLowerCase() === 'true';

function buildBehavioral({ accountAgeDays, postsLastHour, postsLastDay, duplicateMessageCount, avgMessageLength }) {
  return {
    posts_last_hour: postsLastHour ?? 0,
    posts_last_day: postsLastDay ?? 0,
    account_age_days: accountAgeDays ?? 365,
    avg_message_length: avgMessageLength ?? 100,
    duplicate_message_count: duplicateMessageCount ?? 0
  };
}

async function gatherMessageContext(senderId, content) {
  const User = require('../models/User');
  const user = senderId ? await User.findById(senderId).select('createdAt').lean() : null;
  const accountAgeDays = user?.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
    : 365;

  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const oneDayAgo = new Date(Date.now() - 86400 * 1000);
  const [postsLastHour, postsLastDay, duplicates] = await Promise.all([
    Message.countDocuments({ sender: senderId, createdAt: { $gte: oneHourAgo } }),
    Message.countDocuments({ sender: senderId, createdAt: { $gte: oneDayAgo } }),
    Message.countDocuments({ sender: senderId, content, createdAt: { $gte: oneDayAgo } })
  ]);

  return buildBehavioral({
    accountAgeDays,
    postsLastHour,
    postsLastDay,
    duplicateMessageCount: duplicates,
    avgMessageLength: content?.length || 0
  });
}

async function gatherDiscussionContext(authorId, content) {
  const Discussion = require('../models/Discussion');
  const User = require('../models/User');
  const user = authorId ? await User.findById(authorId).select('createdAt').lean() : null;
  const accountAgeDays = user?.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
    : 365;

  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const oneDayAgo = new Date(Date.now() - 86400 * 1000);
  const [postsLastHour, postsLastDay] = await Promise.all([
    Discussion.countDocuments({ author: authorId, createdAt: { $gte: oneHourAgo } }),
    Discussion.countDocuments({ author: authorId, createdAt: { $gte: oneDayAgo } })
  ]);

  return buildBehavioral({
    accountAgeDays,
    postsLastHour,
    postsLastDay,
    avgMessageLength: content?.length || 0
  });
}

async function gatherPostContext(authorId, content) {
  const User = require('../models/User');
  const user = authorId ? await User.findById(authorId).select('createdAt').lean() : null;
  const accountAgeDays = user?.createdAt
    ? Math.max(0, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000))
    : 365;

  const oneHourAgo = new Date(Date.now() - 3600 * 1000);
  const oneDayAgo = new Date(Date.now() - 86400 * 1000);
  const [postsLastHour, postsLastDay] = await Promise.all([
    Post.countDocuments({ author: authorId, createdAt: { $gte: oneHourAgo } }),
    Post.countDocuments({ author: authorId, createdAt: { $gte: oneDayAgo } })
  ]);

  return buildBehavioral({
    accountAgeDays,
    postsLastHour,
    postsLastDay,
    avgMessageLength: content?.length || 0
  });
}

async function classify({ text, userId, contentType, behavioral, graph }) {
  const payload = {
    text,
    user_id: userId ? String(userId) : null,
    content_type: contentType,
    behavioral,
    graph
  };

  try {
    const { data } = await axios.post(`${ML_URL}/predict`, payload, { timeout: ML_TIMEOUT });
    return { ok: true, data };
  } catch (err) {
    console.warn('[spam] ML service unreachable:', err.message);
    if (FAIL_OPEN) {
      return {
        ok: false,
        data: {
          is_spam: false,
          score: 0,
          label: 'ham',
          bert_score: 0,
          graphsage_score: 0,
          xgboost_score: 0,
          reasons: ['ml_service_unavailable']
        }
      };
    }
    throw err;
  }
}

async function logDetection({ contentType, contentId, author, text, prediction }) {
  if (!prediction) return;
  await Detection.create({
    contentType,
    contentId,
    author,
    text,
    score: prediction.score,
    label: prediction.label,
    bertScore: prediction.bert_score,
    graphsageScore: prediction.graphsage_score,
    xgboostScore: prediction.xgboost_score,
    reasons: prediction.reasons || [],
    status: prediction.is_spam ? 'pending' : 'approved'
  });
}

module.exports = {
  classify,
  logDetection,
  gatherMessageContext,
  gatherPostContext,
  gatherDiscussionContext
};
