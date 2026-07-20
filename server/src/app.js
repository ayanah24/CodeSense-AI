import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import passport, { initPassport } from './config/passport.js';
import { createServer } from 'http';

import connectMongoDB from './config/mongodb.js';
import redisConnection from './config/redis.js';
import { pinecone } from "./config/pineconeClient.js";
import { initSocket } from './socket/socketManager.js';

import webhookRoutes from './routes/webhook.js';
import reviewRoutes from './routes/reviews.js';
import manualRoutes from './routes/manual.js';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middleware/authMiddleware.js';

import repoRoutes from './routes/repoRoutes.js';
import { generateEmbedding } from './services/embeddingService.js';
import reviewApiRoutes from "./routes/reviewApiRoutes.js";
import apiKeyRoutes from "./routes/apiKeyRoutes.js";

initPassport(); // must run after dotenv.config() so env vars are available

const app = express();

// DB + Redis
await connectMongoDB();

//pinecone
try {
  const pineconeDesc = await pinecone.describeIndex(process.env.PINECONE_INDEX);
  console.log('Pinecone connected - index:', pineconeDesc.name);
} catch (err) {
  console.error('Pinecone connection error:', err.message);
}

//  MIDDLEWARE
app.use(helmet());

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
app.get('/api/test-embedding', async (req, res) => {
  try {
    const { generateEmbedding } = await import('./services/embeddingService.js');
    const vector = await generateEmbedding('function processUser(userId) { return db.find({ id: userId }); }');
    res.json({
      success: true,
      vectorLength: vector.length,
      first5Values: vector.slice(0, 5)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

//API key management (JWT-protected inside the router)
app.use("/api/keys", apiKeyRoutes);

// Review API (protected by API key) — rate-limited to prevent auth brute-force
const apiKeyAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/v1/review", apiKeyAuthLimiter, reviewApiRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const checks = {};

  // MongoDB
  try {
    const mongoose = await import('mongoose');
    checks.mongodb = mongoose.default.connection.readyState === 1 ? 'ok' : 'disconnected';
  } catch (e) { checks.mongodb = `error: ${e.message}`; }

  // Redis
  try {
    const { default: redis } = await import('./config/redis.js');
    await redis.ping();
    checks.redis = 'ok';
  } catch (e) { checks.redis = `error: ${e.message}`; }

  // Gemini API key
  const geminiKey = process.env.GEMINI_API_KEY;
  checks.geminiKey = geminiKey ? (geminiKey.length > 10 ? 'set' : 'too short') : 'missing';

  // GitHub token
  const ghToken = process.env.GITHUB_TOKEN;
  checks.githubToken = ghToken ? (ghToken.startsWith('ghp_') ? 'ok' : 'unexpected format') : 'missing';

  // Webhook URL
  checks.webhookUrl = process.env.WEBHOOK_URL || 'missing';

  const allOk = checks.mongodb === 'ok' && checks.redis === 'ok';
  res.status(allOk ? 200 : 500).json({ ok: allOk, checks });
});

app.use('/auth', authRoutes);
app.use('/webhook', webhookRoutes);

// protected
app.use('/api/reviews', authMiddleware, reviewRoutes);
app.use('/api/review/manual', authMiddleware, manualRoutes);
app.use('/api/repos', authMiddleware, repoRoutes);

// http server socket
const httpServer = createServer(app);
initSocket(httpServer);

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
