import {Router} from 'express';
import {handleManualReview} from '../controllers/manualController.js';

const router = Router();

router.post('/',handleManualReview);

export default router;