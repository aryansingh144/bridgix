const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{ type: String }],
  read: { type: Boolean, default: false },
  flagged: { type: Boolean, default: false },
  spamScore: { type: Number, default: 0 },
  moderationStatus: { type: String, enum: ['clean', 'pending', 'approved', 'removed'], default: 'clean' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
