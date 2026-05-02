const mongoose = require('mongoose');

// DUMMY MODEL: Just to keep the server from crashing until Member 1 finishes!
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});

module.exports = mongoose.model('User', userSchema);