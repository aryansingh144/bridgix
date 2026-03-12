const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'alumni', 'college'], default: 'student' },
  avatar: { type: String, default: '' },
  age: { type: Number },
  education: { type: String },
  status: { type: String },
  yearOfStudy: { type: String },
  location: { type: String },
  occupation: { type: String },
  topSkills: [{ type: String }],
  techLiteracy: { type: String },
  bio: { type: String },
  services: [{ type: String }],
  workExperience: [{ type: String }],
  skills: [{ type: String }],
  coreNeeds: [{ type: String }],
  points: { type: Number, default: 0 },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  college: { type: String },
  quote: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
