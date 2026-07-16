import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { fetchPRDiff, postPRComment, setStatusCheck } from '../services/githubService.js';
import { parseDiff, formatDiffForLLM } from '../services/diffParser.js';
import { getCodeReview } from '../services/llmService.js';
import connectMongoDB from '../config/mongodb.js';
import Review from '../models/Review.js';
import Repo from '../models/Repo.js';
import 'dotenv/config';
import { searchSimilarChunks } from '../services/pineconeService.js';

await connectMongoDB();

const publisher = createRedisConnection();

const worker = new Worker(
  'code-review',

  async (job) => {
    const { prNumber, prTitle, author, diffUrl, repoName, commitSha } = job.data;

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
    await job.updateProgress(25);
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
    await job.updateProgress(40);
    const formattedDiff = formatDiffForLLM(parsedFiles);

    // Step 3.5 — Look up repo owner (moved up — needed for RAG)
    console.log('Looking up repo owner...');
    const repo = await Repo.findOne({ repoName, isActive: true });
    if (!repo) {
      console.log(`Repo ${repoName} not registered — reviewing without context`);
    } else {
      console.log(`Repo owner found — userId: ${repo.userId}`);
    }

    // Step 3.6 — RAG: search pinecone for relevant codebase context
    console.log('Step 3.6: Searching codebase context from Pinecone...');
    let codebaseContext = [];
    if (repo) {
      try {
        codebaseContext = await searchSimilarChunks(
          repo._id.toString(),
          formattedDiff,
          5
        );
        console.log(`Found ${codebaseContext.length} relevant chunks from codebase`);
      } catch (err) {
        console.warn('Pinecone search failed — reviewing without context:', err.message);
        codebaseContext = [];
      }
    }

    // Step 4 — Call Gemini API with codebase context
    console.log('Step 4: Calling Gemini API...');
    await job.updateProgress(60);
    const review = await getCodeReview(prTitle, author, formattedDiff, codebaseContext);
    console.log('Review received from Gemini');

    //Save review to MongoDB
    console.log('Saving review to MongoDB...');
    const savedReview = await Review.create({
      userId: repo ? repo.userId : undefined,
      prNumber,
      prTitle,
      author,
      repoName,
      commitSha,
      summary: review.summary,
      score: review.score,
      issues: review.issues,
      positives: review.positives,
      status: 'reviewed',
      passed: review.score.overall >= 70,
    });
    console.log(`Review saved to MongoDB — ID: ${savedReview._id}`);

    //redis publish — only when we know the repo owner
    if (repo?.userId) {
      const payload = JSON.stringify({
        userId: repo.userId.toString(),
        review: {
          _id: savedReview._id,
          prNumber: savedReview.prNumber,
          prTitle: savedReview.prTitle,
          author: savedReview.author,
          repoName: savedReview.repoName,
          score: savedReview.score,
          passed: savedReview.passed,
          status: savedReview.status,
          createdAt: savedReview.createdAt,
        },
      });

      await publisher.publish('review:complete', payload);
      console.log(`Published review:complete for userId: ${repo.userId}`);
    }

    //step 5 - post comment on github pr
    console.log('Step 5: Posting review comment on GitHub...');
    await job.updateProgress(75);
    await postPRComment(repoName, prNumber, review);
    console.log('Review comment posted successfully');

    //step 6 - set merge gate status check
    console.log('Step 6: Setting merge gate status check...');
    await job.updateProgress(90);
    await setStatusCheck(repoName, commitSha, review.score.overall);

    //print review summary and scores to console
    await job.updateProgress(100);
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

//Event listeners 
worker.on('completed', (job, result) => {
  console.log(`✅ Job ${job.id} completed — Score: ${result.score}/100`);
});

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job.id} failed: ${err.message}`);
  console.error(`Attempts: ${job.attemptsMade} of ${job.opts.attempts}`);
});

worker.on('progress', (job, progress) => {
  console.log(`⏳ Progress: ${progress}%`);
});

worker.on('error', (err) => {
  console.error('Worker error:', err.message);
});

console.log('Review Worker started — waiting for jobs...\n');

export default worker;