const { connectDb } = require('../_lib/db');
const { requireAuth } = require('../_lib/auth');
const { handleError, methodNotAllowed, sendJson } = require('../_lib/http');
const CapturedImage = require('../_lib/models/CapturedImage');

function serializeImage(image) {
  return {
    id: image._id.toString(),
    owner: image.owner.toString(),
    ownerName: image.ownerName,
    ownerRole: image.ownerRole,
    url: image.cloudinaryUrl,
    publicId: image.publicId,
    createdAt: image.createdAt
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return methodNotAllowed(res, ['GET']);
  }

  try {
    await connectDb();
    const currentUser = await requireAuth(req);
    const images = await CapturedImage.find({ owner: currentUser._id })
      .sort({ createdAt: -1 })
      .limit(100);
    return sendJson(res, 200, { images: images.map(serializeImage) });
  } catch (error) {
    return handleError(res, error);
  }
};
