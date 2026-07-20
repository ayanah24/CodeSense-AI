import express from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth.js";
import reviewQueue from "../queues/reviewQueue.js";
import Review from "../models/Review.js";

const router = express.Router();

router.use(apiKeyAuth);

const MAX_DIFF_SIZE = 200_000;

// POST /api/v1/review 
router.post("/", async (req, res) => {
  try {
    const { diff, repoName } = req.body;

    if (!diff || typeof diff !== "string") {
      return res.status(400).json({ error: "`diff` (string) is required" });
    }

    if (diff.length > MAX_DIFF_SIZE) {
      return res.status(413).json({ error: "Diff exceeds maximum allowed size" });
    }

    const job = await reviewQueue.add("review-job", {
      diff,
      repoName: repoName || null,
      source: "api",
      userId: req.user.userId,
    });
    console.log("Polling — jobId:", job.id, "| req.user.userId:", req.user.userId);
    res.status(202).json({
      jobId: job.id,
      status: "queued",
    });
  } catch (err) {
    console.error("Review submission error:", err.message);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

router.get("/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    // req.user.userId is the field set by apiKeyAuth middleware (same as used in POST)
    const review = await Review.findOne({
      jobId,
      userId: req.user.userId,
    });

    if (review) {
      return res.status(200).json({
        jobId,
        status: "completed",
        result: {
          summary: review.summary,
          score: review.score,
          issues: review.issues,
          positives: review.positives,
          passed: review.passed,
        },
      });
    }

    // Job not in MongoDB yet — check BullMQ queue for current state
    const job = await reviewQueue.getJob(jobId);

    if (!job) {
      // Job was completed and removed from BullMQ but not found in DB — or never existed
      return res.status(404).json({ error: "Job not found. It may have expired or the jobId is invalid." });
    }

    const state = await job.getState();

    if (state === "failed") {
      return res.status(200).json({ jobId, status: "failed" });
    }

    return res.status(200).json({ jobId, status: state ?? "processing" });
  }
  catch (error) {
    console.error("Review status error:", error.message);
    res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;