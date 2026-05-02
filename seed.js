const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import your models
const Staff = require('./models/Staff');
const Task = require('./models/Task');
const Notice = require('./models/Notice');
const Settings = require('./models/Settings'); // Added for Member 2
// const User = require('./models/User'); // Member 1's model

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database. Wiping old data...');

    // Clear existing data
    await Staff.deleteMany();
    await Task.deleteMany();
    await Notice.deleteMany();
    await Settings.deleteMany(); // Clear old settings
    // await User.deleteMany();

    // SRS Requirement: Encrypt passwords using bcrypt with cost 10
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash('password123', salt);

    console.log('Seeding System Settings...');
    await Settings.create({
      hospitalName: 'WardLog General Hospital',
      timezone: 'PKT',
      sessionTimeout: 15, // Matches SRS security requirement[cite: 2]
      maxPatients: 200,
      backupFrequency: 'Daily' // Matches SRS reliability requirement[cite: 2]
    });

    console.log('Seeding Staff Directory...');
    const staffData = [
      { name: 'Dr. Sarah Smith', role: 'Doctor', specialty: 'Cardiology', department: 'General Ward', phone: '555-0101', email: 'sarah@wardlog.com' },
      { name: 'Nurse John Doe', role: 'Nurse', department: 'ICU', phone: '555-0102', email: 'john@wardlog.com' },
      { name: 'Admin Alice', role: 'Admin', department: 'Operations', phone: '555-0103', email: 'alice@wardlog.com' }
    ];
    await Staff.insertMany(staffData); // Matches frontend mock data[cite: 1]

    console.log('Seeding Notices...');
    await Notice.insertMany([
      { 
        title: 'System Maintenance', 
        content: 'The system will be down for 2 hours this Sunday.', 
        category: 'IT', 
        author: new mongoose.Types.ObjectId() 
      }
    ]);

    console.log('✅ Seeding Complete! System settings and mock data are ready.');
    process.exit();
  } catch (error) {
    console.error('Seeding Failed:', error);
    process.exit(1);
  }
};

seedDatabase();