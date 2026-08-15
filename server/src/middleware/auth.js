import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guidex_jwt_secret_key_2026');

    // Try to load the full user from MongoDB
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-passwordHash');
    } catch {
      // DB unavailable — fall through to JWT-based user below
    }

    if (user) {
      // Full MongoDB user found
      req.user = user;
    } else {
      // DB unavailable or user not in this DB instance (e.g. in-memory after restart)
      // Use the JWT payload to construct a minimal user object so AI routes still work
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Learner',
        email: decoded.email || '',
        goal: decoded.goal || 'Software Engineering',
        level: decoded.level || 'Beginner',
        // Mark as JWT-only so write routes can handle gracefully
        _jwtOnly: true,
      };
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export default protect;
