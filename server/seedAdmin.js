const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is missing in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@jobportal.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Platform Administrator';

    let admin = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    if (admin) {
      admin.name = adminName;
      admin.role = 'Admin';
      admin.password = hashedPassword;
      await admin.save();
      console.log(`✅ Admin account updated successfully!`);
    } else {
      admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'Admin',
      });
      console.log(`✅ Head Admin account created successfully!`);
    }

    console.log('-------------------------------------------');
    console.log(`Email    : ${adminEmail}`);
    console.log(`Password : ${adminPassword}`);
    console.log(`Role     : Admin`);
    console.log('-------------------------------------------');
    console.log('You can now log in using the Sign In tab.');

    process.exit(0);
  } catch (error) {
    console.error('Failed to seed admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
