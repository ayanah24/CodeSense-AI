import {Router} from 'express';
import{getAllReviews,getReviewsById,getReviewsByRepo,getStats,deleteReviewById} from '../controllers/reviewController.js';

const router = Router();

router.get('/stats',getStats);
router.get('/', getAllReviews);
router.get('/:id',getReviewsById);
router.get('/repo/:repoName',getReviewsByRepo);
router.delete('/:id', deleteReviewById);

export default router;
