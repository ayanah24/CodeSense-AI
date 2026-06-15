import {Router} from 'express';
import{getAllReviews,getReviewsById,getReviewsByRepo,getStats} from '../controllers/reviewController.js';

const router = Router();

router.get('/stats',getStats);
router.get('/', getAllReviews);
router.get('/:id',getReviewsById);
router.get('/repo/:repoName',getReviewsByRepo);

export default router;
