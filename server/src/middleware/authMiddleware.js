import { verifyToken } from '../utils/jwt.js';
import redisConnection from '../config/redis.js';
import User from '../models/User.js';
export async function authMiddleware(req, res, next) {
  try {
    //extract token
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    //verify jwt
    const decoded = verifyToken(token);

    //check redis session
    const sessionExists = await redisConnection.get(`session:${decoded.jti}`);

    if (!sessionExists) {
      return res.status(401).json({ error: 'Session expired or revoked' });
    }

    req.user = decoded;

    //fetch  full user from mongodb
    const user= await User.findById(decoded.userId).select(
       'username displayName avatarUrl role email'
    );
    if(!user){
      return res.status(401).json({error:'User not found'});
    }

    req.user = {
      userId:      user._id.toString(),
      username:    user.username,
      displayName: user.displayName,
      avatarUrl:   user.avatarUrl,
      role:        user.role,
      email:       user.email,
      jti:         decoded.jti,  
    };
    
    next();
   
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}