import './config/env.js'; // ← must be first: loads dotenv before any other import
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import passport, { initPassport } from './config/passport.js';

import connectMongoDB from './config/mongodb.js';
import redisConnection from './config/redis.js';

import webhookRoutes from './routes/webhook.js';
import reviewRoutes from './routes/reviews.js';
import manualRoutes from './routes/manual.js';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

import repoRoutes from './routes/repoRoutes.js';

initPassport(); // must run after dotenv.config() so env vars are available

const app = express();

// DB + Redis
await connectMongoDB();


//  MIDDLEWARE
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,             
}));

// raw body for webhook HMAC verification
app.use('/webhook', express.raw({ type: '*/*' }));

// JSON for everything else
app.use((req, res, next) => {
  if (req.path.startsWith('/webhook')) return next();
  express.json()(req, res, next);
});

app.use(cookieParser());          
app.use(passport.initialize());     

// ROUTES 
// public
app.get('/', (req, res) => {
  res.json({ status: 'codeSense AI server is running' });
});
app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

// protected
app.use('/api/reviews', authMiddleware, reviewRoutes);
app.use('/api/review/manual', authMiddleware, manualRoutes);
app.use('/api/repos',authMiddleware,repoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
