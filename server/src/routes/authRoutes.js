import express from 'express';
import passport from 'passport';
import { signToken, SESSION_TTL } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import redisConnection from '../config/redis.js';

const router = express.Router();

router.get('/github',
  passport.authenticate('github', { session: false })
);

router.get('/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const user = req.user;

      const { token, jti } = signToken({
        userId: user._id.toString(),
        role:   user.role,
      });

      // ioredis syntax — EX as separate argument
      await redisConnection.set(
        `session:${jti}`,
        user._id.toString(),
        'EX',
        SESSION_TTL
      );

      res.cookie('token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:   SESSION_TTL * 1000,
      });

      res.redirect(`${process.env.CLIENT_URL}/dashboard`);

    } catch (err) {
      console.error('Callback error:', err);
      res.redirect(`${process.env.CLIENT_URL}/login?error=server_error`);
    }
  }
);

router.post('/logout', authMiddleware, async (req, res) => {
  try {
    await redisConnection.del(`session:${req.user.jti}`);
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({
    userId: req.user.userId,
    role:   req.user.role,
  });
});

export default router;