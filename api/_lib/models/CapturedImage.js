const mongoose = require('mongoose');

const capturedImageSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ownerName: {
      type: String,
      required: true
    },
    ownerRole: {
      type: String,
      required: true
    },
    cloudinaryUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    },
    bytes: Number,
    width: Number,
    height: Number,
    format: String
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.CapturedImage ||
  mongoose.model('CapturedImage', capturedImageSchema);
