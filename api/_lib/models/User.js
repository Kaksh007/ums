const mongoose = require('mongoose');

const roles = ['Admin', 'Supervisor', 'Worker'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 160
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: roles,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
module.exports.roles = roles;
