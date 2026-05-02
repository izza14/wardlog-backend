const express = require('express');
const swapRoutes = require('./routes/swapRoutes');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware 
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// --- ROUTES (Ward Coordination Module) ---
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/roster', require('./routes/rosterRoutes'));
app.use('/api/swap-requests', require('./routes/swapRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/notices', require('./routes/noticeRoutes'));
app.use('/api/ward', require('./routes/wardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); 
// Global Error Handler[cite: 1]
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    data: null,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));