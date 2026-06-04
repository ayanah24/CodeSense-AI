import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import 'dotenv/config';

const worker = new Worker(
  'code-review',
  async (job) => {
    const { prNumber, prTitle, author, diffUrl, repoName } = job.data;

    console.log(`Worker picked job: ${job.id}`);
    console.log(`Processing PR #${prNumber} - "${prTitle}"`);
    console.log(`Repo: ${repoName} | Author: ${author}`);

    await job.updateProgress(10);
    console.log('Job received, starting processing...');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(50);
    console.log('Halfway through processing...');

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await job.updateProgress(100);
    console.log('Finished processing');

    return {
      prNumber,
      repoName,
      status: 'reviewed',
      reviewedAt: new Date().toISOString(),
    };
  },
  {
    connection: createRedisConnection(),  // fresh connection
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000,
    },
  }
);

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed`);
  console.log('Result:', result);
});

worker.on('failed', (job, err) => {
  console.error( `Job ${job.id} failed:`, err.message);
  console.error(`Attempts made: ${job.attemptsMade} of ${job.opts.attempts}`);
});

worker.on('progress', (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

console.log('Review Worker started and waiting for jobs...');

export default worker;