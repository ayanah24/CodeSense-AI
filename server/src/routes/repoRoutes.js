import express from 'express';
import Repo from '../models/Repo.js';
import User from '../models/User.js';        
import {
  fetchUserRepos,
  registerWebhook,
  deleteWebhook,
} from '../services/githubRepoService.js';

const router = express.Router();

// ── GET /api/repos 
router.get('/', async (req, res) => {
  try {
    const repos = await Repo.find({
      userId:   req.user.userId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: repos });

  } catch (err) {
    console.error('Error fetching repos:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch repos' });
  }
});

//GET /api/repos/github 
router.get('/github', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('+githubAccessToken');

    if (!user.githubAccessToken) {
      return res.status(400).json({
        success: false,
        error:   'GitHub token not found. Please re-login.',
      });
    }

    const repos = await fetchUserRepos(user.githubAccessToken);

    const connectedRepos = await Repo.find({
      userId:   req.user.userId,
      isActive: true,
    }).select('githubRepoId');

    const connectedIds = new Set(connectedRepos.map(r => r.githubRepoId));

    const reposWithStatus = repos.map(repo => ({
      ...repo,
      connected: connectedIds.has(repo.id),
    }));

    res.json({ success: true, data: reposWithStatus });

  } catch (err) {
    if (err.message === 'GITHUB_TOKEN_INVALID') {
      return res.status(401).json({
        success: false,
        error:   'GitHub token expired. Please login again.',
      });
    }
    if (err.message === 'GITHUB_TOKEN_INSUFFICIENT_SCOPE') {
      return res.status(403).json({
        success: false,
        error:   'Insufficient permissions. Please re-authorize.',
      });
    }
    console.error('Error fetching GitHub repos:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch GitHub repos' });
  }
});

//POST /api/repos/connect 
router.post('/connect', async (req, res) => {
  try {
    const { githubRepoId, repoName } = req.body;

    if (!githubRepoId || !repoName) {
      return res.status(400).json({
        success: false,
        error:   'githubRepoId and repoName are required',
      });
    }

    // Already connected check
    const existing = await Repo.findOne({
      githubRepoId,
      userId:   req.user.userId,
      isActive: true,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error:   'Repo already connected',
      });
    }

    const user = await User.findById(req.user.userId)
      .select('+githubAccessToken');

    // GitHub  webhook register.
    const hookId = await registerWebhook(
      user.githubAccessToken,
      repoName
    );

    // MongoDB save 
    const repo = await Repo.findOneAndUpdate(
      { githubRepoId },
      {
        userId: req.user.userId,
        githubRepoId,
        repoName,
        hookId,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    console.log(`Repo connected: ${repoName} by ${req.user.username}`);
    res.json({ success: true, data: repo });

  } catch (err) {
    console.error('Error connecting repo:', err.message);
    res.status(500).json({ success: false, error: 'Failed to connect repo' });
  }
});

// POST /api/repos/disconnect
router.post('/disconnect', async (req, res) => {
  try {
    const { repoId } = req.body;

    if (!repoId) {
      return res.status(400).json({
        success: false,
        error:   'repoId is required',
      });
    }

    const repo = await Repo.findOne({
      _id:    repoId,
      userId: req.user.userId,
    });

    if (!repo) {
      return res.status(404).json({
        success: false,
        error:   'Repo not found',
      });
    }

    // GitHub  webhook delete
    if (repo.hookId) {
      const user = await User.findById(req.user.userId)
        .select('+githubAccessToken');

      await deleteWebhook(
        user.githubAccessToken,
        repo.repoName,
        repo.hookId
      );
    }

    //not  Delete — history preserve
    repo.isActive = false;
    await repo.save();

    console.log(`✅ Repo disconnected: ${repo.repoName} by ${req.user.username}`);
    res.json({ success: true, message: 'Repo disconnected successfully' });

  } catch (err) {
    console.error('Error disconnecting repo:', err.message);
    res.status(500).json({ success: false, error: 'Failed to disconnect repo' });
  }
});

export default router;