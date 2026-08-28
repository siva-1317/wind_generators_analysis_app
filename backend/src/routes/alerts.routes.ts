import { Router } from 'express';
import { alertsController } from '../controllers/alerts.controller';

const router = Router();

router.get('/', alertsController.getAlerts);
router.patch('/:id/acknowledge', alertsController.acknowledgeAlert);

export default router;
