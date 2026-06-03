import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';

const reviewQueue = new Queue('code-review', {
  connection: createRedisConnection(),  // fresh connection
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});

console.log('Review queue initialized');

export default reviewQueue;