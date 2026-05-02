const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shift: { type: mongoose.Schema.Types.ObjectId, required: true },
  swapWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', swapRequestSchema);