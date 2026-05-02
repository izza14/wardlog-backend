const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  hospitalName: { type: String, default: 'WardLog General Hospital' },
  timezone: { type: String, default: 'PKT' },
  
  // SRS Requirement: Session timeout for auto-logout[cite: 2, 25]
  sessionTimeout: { type: Number, default: 15 }, 
  
  maxPatients: { type: Number, default: 200 },
  
  // SRS Requirement: Daily backup frequency for reliability[cite: 2, 25]
  backupFrequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly'], default: 'Daily' } 
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);