const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  contentType: { type: String, enum: ['message', 'post', 'discussion'], required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  score: { type: Number, required: true },
  label: { type: String, enum: ['spam', 'ham'], required: true },
  bertScore: { type: Number },
  graphsageScore: { type: Number },
  xgboostScore: { type: Number },
  reasons: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'removed'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

detectionSchema.index({ status: 1, createdAt: -1 });
detectionSchema.index({ contentType: 1, contentId: 1 });

module.exports = mongoose.model('Detection', detectionSchema);
