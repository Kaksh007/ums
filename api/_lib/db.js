const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

let cachedConnection = null;
let seedPromise = null;

async function connectDb() {
  if (cachedConnection) {
    return cachedConnection;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }

  mongoose.set('strictQuery', true);
  cachedConnection = await mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false
  });

  await seedAdmin();
  return cachedConnection;
}

function seedAdmin() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
      const password = process.env.ADMIN_PASSWORD || 'Admin@123';
      const existingAdmin = await User.findOne({ email });

      if (!existingAdmin) {
        const passwordHash = await bcrypt.hash(password, 12);
        await User.create({
          name: 'System Admin',
          email,
          passwordHash,
          role: 'Admin'
        });
      }
    })();
  }

  return seedPromise;
}

module.exports = { connectDb };
