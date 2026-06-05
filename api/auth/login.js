const bcrypt = require('bcryptjs');
const { connectDb } = require('../_lib/db');
const { handleError, methodNotAllowed, readJson, sendJson } = require('../_lib/http');
const User = require('../_lib/models/User');
const { serializeUser, signToken } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return methodNotAllowed(res, ['POST']);
  }

  try {
    await connectDb();
    const body = await readJson(req);
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');

    if (!email || !password) {
      return sendJson(res, 400, { message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    const isValid = user
      ? await bcrypt.compare(password, user.passwordHash)
      : false;

    if (!isValid) {
      return sendJson(res, 401, { message: 'Invalid email or password.' });
    }

    return sendJson(res, 200, {
      token: signToken(user),
      user: serializeUser(user)
    });
  } catch (error) {
    return handleError(res, error);
  }
};
