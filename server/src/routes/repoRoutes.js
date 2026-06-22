import express from 'express';
import Repo from '../models/Repo.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router=   express.Router();

//register a repo called when user connects its repo
router.post('/register',authMiddleware, async(req , res)=>{
    try{
        const {githubRepoId , repoName} = req.body;

        if(!githubRepoId || !repoName){
            return res.status(400).json({error:'githubrepoid and reponame are missing'});
        }

        const repo=await Repo.findOneAndUpdate(
            { userId: req.user.userId, githubRepoId },
            {
                userId: req.user.userId,
                githubRepoId,
                repoName,
                isActive:true,
            },
            {upsert:true,new:true}
        );
        res.json({message:'Repo registered', repo});
    }catch(err){
        res.status(500).json({error:'Failed to register repo'});
    }
});

// Get all repos for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const repos = await Repo.find({
      userId:   req.user.userId,
      isActive: true,
    });
    res.json({ data: repos });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch repos' });
  }
});

// Disconnect a repo
router.patch('/:id/disconnect', authMiddleware, async (req, res) => {
  try {
    await Repo.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId }, // userId check = security
      { isActive: false }
    );
    res.json({ message: 'Repo disconnected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect repo' });
  }
});

export default router;
