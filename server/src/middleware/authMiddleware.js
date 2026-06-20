import { verifyToken } from '../utils/jwt.js';
import redisConnection from '../config/redis.js';

export async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = verifyToken(token);

    // ioredis syntax — same as node-redis for get
    const sessionExists = await redisConnection.get(`session:${decoded.jti}`);

    if (!sessionExists) {
      return res.status(401).json({ error: 'Session expired or revoked' });
    }

    req.user = decoded;
    next();

  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}