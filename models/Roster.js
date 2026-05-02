const mongoose = require('mongoose');

// Define a sub-schema for individual shifts[cite: 1]
const shiftSchema = new mongoose.Schema({
  shift: { 
    type: String, 
    enum: ['Morning', 'Evening', 'Night'], 
    required: true 
  },
  staffName: { type: String, required: true },
  role: { type: String, required: true },
  ward: { type: String, required: true }
});

const rosterSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  shifts: [shiftSchema] // Array of shift sub-documents allows for individual ID targeting[cite: 1, 24]
}, { timestamps: true });

module.exports = mongoose.model('Roster', rosterSchema);