import Redis from 'ioredis';
import 'dotenv/config';

// Factory function — har baar naya connection banao
const createRedisConnection = () => new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

// Separate connections
const redisConnection = createRedisConnection();

redisConnection.on('connect', () => {
  console.log('Connected to Redis');
});

redisConnection.on('error', (err) => {
  console.error('Redis error:', err.message);
});

export { createRedisConnection };
export default redisConnection;