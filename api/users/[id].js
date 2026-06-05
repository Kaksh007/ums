const { connectDb } = require('../_lib/db');
const { requireAuth, requireRoles } = require('../_lib/auth');
const { handleError, methodNotAllowed, sendJson } = require('../_lib/http');
const CapturedImage = require('../_lib/models/CapturedImage');
const User = require('../_lib/models/User');

module.exports = async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return methodNotAllowed(res, ['DELETE']);
  }

  try {
    await connectDb();
    const currentUser = await requireAuth(req);
    requireRoles(currentUser, ['Admin']);

    const id = req.query.id;
    if (!id) {
      return sendJson(res, 400, { message: 'User id is required.' });
    }

    if (id === currentUser._id.toString()) {
      return sendJson(res, 400, { message: 'Admin cannot delete their own account.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return sendJson(res, 404, { message: 'User not found.' });
    }

    if (user.role === 'Admin') {
      return sendJson(res, 400, { message: 'Admin accounts cannot be removed here.' });
    }

    await CapturedImage.deleteMany({ owner: user._id });
    await user.deleteOne();

    return sendJson(res, 200, { message: 'User removed.' });
  } catch (error) {
    return handleError(res, error);
  }
};
