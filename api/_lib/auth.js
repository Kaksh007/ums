const jwt = require('jsonwebtoken');
const { connectDb } = require('./db');
const User = require('./models/User');

function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
}

async function requireAuth(req) {
  await connectDb();

  const header = req.headers.authorization || req.headers.Authorization;
  const token = header && header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    const error = new Error('Authentication required.');
    error.statusCode = 401;
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (!user) {
      const error = new Error('User account no longer exists.');
      error.statusCode = 401;
      throw error;
    }
    return user;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 401;
      error.message = 'Invalid or expired token.';
    }
    throw error;
  }
}

function requireRoles(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    const error = new Error('You do not have permission to perform this action.');
    error.statusCode = 403;
    throw error;
  }
}

function serializeUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };
}

module.exports = { requireAuth, requireRoles, serializeUser, signToken };
