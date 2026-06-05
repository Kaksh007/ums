const { v2: cloudinary } = require('cloudinary');
const { connectDb } = require('../_lib/db');
const { requireAuth, requireRoles } = require('../_lib/auth');
const { handleError, methodNotAllowed, readJson, sendJson } = require('../_lib/http');
const CapturedImage = require('../_lib/models/CapturedImage');

function configureCloudinary() {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    const error = new Error(`Cloudinary is not configured: ${missing.join(', ')}.`);
    error.statusCode = 500;
    throw error;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

function serializeImage(image) {
  return {
    id: image._id.toString(),
    owner: image.owner.toString(),
    ownerName: image.ownerName,
    ownerRole: image.ownerRole,
    url: image.cloudinaryUrl,
    publicId: image.publicId,
    bytes: image.bytes,
    width: image.width,
    height: image.height,
    format: image.format,
    createdAt: image.createdAt
  };
}

module.exports = async function handler(req, res) {
  try {
    await connectDb();
    const currentUser = await requireAuth(req);

    if (req.method === 'GET') {
      requireRoles(currentUser, ['Admin', 'Supervisor']);
      const images = await CapturedImage.find({})
        .sort({ createdAt: -1 })
        .limit(100);
      return sendJson(res, 200, { images: images.map(serializeImage) });
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      const imageData = String(body.imageData || '');

      if (!imageData.startsWith('data:image/')) {
        return sendJson(res, 400, {
          message: 'A camera image data URL is required.'
        });
      }

      configureCloudinary();
      const upload = await cloudinary.uploader.upload(imageData, {
        folder: 'robro-user-captures',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      const image = await CapturedImage.create({
        owner: currentUser._id,
        ownerName: currentUser.name,
        ownerRole: currentUser.role,
        cloudinaryUrl: upload.secure_url,
        publicId: upload.public_id,
        bytes: upload.bytes,
        width: upload.width,
        height: upload.height,
        format: upload.format
      });

      return sendJson(res, 201, { image: serializeImage(image) });
    }

    return methodNotAllowed(res, ['GET', 'POST']);
  } catch (error) {
    return handleError(res, error);
  }
};
