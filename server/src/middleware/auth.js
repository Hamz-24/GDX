import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
  try {
    const token = authHeader.split(' ')[1];

    // Support demo/local session tokens seamlessly
    if (token.startsWith('demo_token_')) {
      let demoUser = null;
      try {
        demoUser = await User.findOne({ email: 'demo@student.com' });
        if (!demoUser) demoUser = await User.findOne({});
      } catch (_) {}

      if (demoUser) {
        req.user = demoUser;
      } else {
        req.user = {
          _id: '60d0fe4f5311236168a109ca',
          id: '60d0fe4f5311236168a109ca',
          name: 'Developer',
          email: 'demo@student.com',
          goal: 'DATA STRUCTURES',
          level: 'intermediate',
          timelineWeeks: 4
        };
      }
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'guidex_jwt_secret_key_2026');

    // Try to load the full user from MongoDB
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-passwordHash');
    } catch {
      // DB unavailable
    }

    if (user) {
      req.user = user;
    } else {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'Learner',
        email: decoded.email || '',
        goal: decoded.goal || 'Software Engineering',
        level: decoded.level || 'Beginner',
        _jwtOnly: true,
      };
    }

    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

export default protect;
