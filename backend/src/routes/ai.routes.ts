import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

const router = Router();

router.post('/analyze', aiController.analyzeGenerator);
router.get('/analyses/:generatorId', aiController.getAnalysesByGenerator);

export default router;
