const bcrypt = require('bcryptjs');
const { connectDb } = require('../_lib/db');
const { requireAuth, requireRoles, serializeUser } = require('../_lib/auth');
const { handleError, methodNotAllowed, readJson, sendJson } = require('../_lib/http');
const User = require('../_lib/models/User');

const creatableRoles = ['Supervisor', 'Worker'];

module.exports = async function handler(req, res) {
  try {
    await connectDb();
    const currentUser = await requireAuth(req);

    if (req.method === 'GET') {
      requireRoles(currentUser, ['Admin', 'Supervisor']);
      const users = await User.find({})
        .select('-passwordHash')
        .sort({ createdAt: -1 });
      return sendJson(res, 200, { users: users.map(serializeUser) });
    }

    if (req.method === 'POST') {
      requireRoles(currentUser, ['Admin']);
      const body = await readJson(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const role = String(body.role || '');

      if (!name || !email || !password || !role) {
        return sendJson(res, 400, {
          message: 'Name, email, password, and role are required.'
        });
      }

      if (!creatableRoles.includes(role)) {
        return sendJson(res, 400, {
          message: 'Admin can create Supervisor or Worker accounts only.'
        });
      }

      if (password.length < 8) {
        return sendJson(res, 400, {
          message: 'Password must be at least 8 characters.'
        });
      }

      const duplicate = await User.findOne({ email });
      if (duplicate) {
        return sendJson(res, 409, { message: 'A user with this email already exists.' });
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash, role });
      return sendJson(res, 201, { user: serializeUser(user) });
    }

    if (req.method === 'DELETE') {
      requireRoles(currentUser, ['Admin']);
      const id = String(req.query?.id || '').trim();

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

      const CapturedImage = require('../_lib/models/CapturedImage');
      await CapturedImage.deleteMany({ owner: user._id });
      await user.deleteOne();

      return sendJson(res, 200, { message: 'User removed.' });
    }

    return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  } catch (error) {
    return handleError(res, error);
  }
};
