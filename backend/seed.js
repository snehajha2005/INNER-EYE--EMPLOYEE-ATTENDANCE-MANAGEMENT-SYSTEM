const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const seedHR = async () => {
  try {
    await connectDB();

    const hrExists = await User.findOne({ email: 'hr@company.com' });

    if (hrExists) {
      console.log('HR Account already exists: hr@company.com / Hr@12345');
      process.exit(0);
    }

    await User.create({
      name: 'HR Admin',
      email: 'hr@company.com',
      employeeId: 'HR001',
      password: 'Hr@12345',
      role: 'hr'
    });

    console.log('HR Admin account created successfully! Credentials: hr@company.com / Hr@12345');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedHR();

