const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  aicteCode: { type: String, required: true },
  logo: { type: String, default: '' },
  webinars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  alumni: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('College', collegeSchema);
