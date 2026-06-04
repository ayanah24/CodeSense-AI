import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { fetchPRDiff } from '../services/githubService.js';
import { parseDiff, formatDiffForPrompt } from '../services/diffParser.js';
import { getCodeReview } from '../services/llmService.js';
import 'dotenv/config';

const worker = new Worker(
  'code-review',

  async (job) => {
    const { prNumber, prTitle, author, diffUrl, repoName } = job.data;

    console.log(`\n=============================`);
    console.log(`Worker picked job: ${job.id}`);
    console.log(`PR #${prNumber} - "${prTitle}"`);
    console.log(`Repo: ${repoName} | Author: ${author}`);
    console.log(`=============================\n`);

    // Step 1 — Fetch raw diff from GitHub
    console.log('Step 1: Fetching diff from GitHub...');
    await job.updateProgress(10);
    const rawDiff = await fetchPRDiff(diffUrl);
    console.log('Diff fetched successfully');

    // Step 2 — Parse diff into clean format
    console.log('Step 2: Parsing diff...');
    await job.updateProgress(30);
    const parsedFiles = parseDiff(rawDiff);
    console.log(`Parsed ${parsedFiles.length} changed files`);

    // If no meaningful changes — skip review
    if (parsedFiles.length === 0) {
      console.log('No reviewable changes found — skipping');
      return { prNumber, repoName, status: 'skipped', reason: 'no changes' };
    }

    // Log what files changed
    parsedFiles.forEach((f) => {
      console.log(`  - ${f.filename} (${f.changes.length} changes)`);
    });

    // Step 3 — Format diff for LLM prompt
    console.log('Step 3: Formatting diff for prompt...');
    await job.updateProgress(50);
    const formattedDiff = formatDiffForPrompt(parsedFiles);

    // Step 4 — Call Gemini API
    console.log('Step 4: Calling Gemini API...');
    await job.updateProgress(70);
    const review = await getCodeReview(prTitle, author, formattedDiff);
    console.log('Review received from Gemini');

    // Step 5 — Log the full review
    await job.updateProgress(90);
    console.log('\n========== AI REVIEW ==========');
    console.log(`Summary: ${review.summary}`);
    console.log(`\nScores:`);
    console.log(`  Overall:     ${review.score.overall}/100`);
    console.log(`  Security:    ${review.score.security}/100`);
    console.log(`  Performance: ${review.score.performance}/100`);
    console.log(`  Quality:     ${review.score.quality}/100`);
    console.log(`  Tests:       ${review.score.tests}/100`);

    if (review.issues.length === 0) {
      console.log('\nNo issues found!');
    } else {
      console.log(`\nIssues (${review.issues.length}):`);
      review.issues.forEach((issue, i) => {
        const emoji =
          issue.severity === 'critical' ? '🔴' :
          issue.severity === 'warning' ? '🟡' : '💡';
        console.log(`  ${emoji} ${issue.severity.toUpperCase()} — ${issue.title}`);
        console.log(`     File: ${issue.file} : Line ${issue.line}`);
        console.log(`     ${issue.description}`);
        console.log(`     Fix: ${issue.fix}`);
      });
    }

    if (review.positives && review.positives.length > 0) {
      console.log('\nPositives:');
      review.positives.forEach((p) => console.log(`  ✅ ${p}`));
    }

    console.log('================================\n');

    await job.updateProgress(100);

    // Day 4 — this is where we post comment on GitHub
    // and set merge gate status check

    return {
      prNumber,
      repoName,
      status: 'reviewed',
      score: review.score.overall,
      issueCount: review.issues.length,
      reviewedAt: new Date().toISOString(),
    };
  },

  {
    connection: createRedisConnection(),
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000,
    },
  }
);

worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed`);
  console.log('Result:', result);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
  console.error(`Attempts made: ${job.attemptsMade} of ${job.opts.attempts}`);
});

worker.on('progress', (job, progress) => {
  console.log(`⏳ Job ${job.id} progress: ${progress}%`);
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

console.log('Review Worker started — waiting for jobs...\n');

export default worker;