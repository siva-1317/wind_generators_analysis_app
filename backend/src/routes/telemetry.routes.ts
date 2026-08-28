import { Router } from 'express';
import { telemetryController } from '../controllers/telemetry.controller';

const router = Router();

router.get('/latest', telemetryController.getLatestTelemetry);
router.get('/:generatorId', telemetryController.getTelemetryByGenerator);
router.post('/ingest', telemetryController.ingestTelemetry);

export default router;
