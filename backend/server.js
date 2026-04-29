require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bridgix')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/colleges', require('./routes/colleges'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/events', require('./routes/events'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/moderation', require('./routes/moderation'));

app.get('/', (req, res) => {
  res.json({ message: 'Bridgix API running' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
