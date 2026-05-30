import {Router} from 'express';
import handleWebhook from '../controllers/webhookController.js';

const router=Router();

router.get('/', (req, res) => {
	res.json({ status: 'webhook route is active' });
});

router.post('/',handleWebhook);

export default router;